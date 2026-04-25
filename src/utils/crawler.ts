import { Page } from "puppeteer";

const POPUP_BUTTON_KEYWORDS = [
  "accept",
  "agree",
  "ok",
  "okay",
  "got it",
  "i understand",
  "close",
  "dismiss",
  "allow",
  "confirm",
  "continue",
  "proceed",
  "yes",
  "setuju",
  "tutup",
  "lanjut",
];

const POPUP_SELECTORS = [
  "[class*='cookie']",
  "[class*='consent']",
  "[class*='gdpr']",
  "[class*='popup']",
  "[class*='modal']",
  "[class*='overlay']",
  "[class*='banner']",
  "[id*='cookie']",
  "[id*='consent']",
  "[id*='popup']",
  "[id*='modal']",
  "[id*='overlay']",
  "[role='dialog']",
  "[role='alertdialog']",
];

export async function handlePopups(page: Page): Promise<void> {
  try {
    await page.evaluate((keywords) => {
      const allButtons = Array.from(
        document.querySelectorAll(
          "button, a, [role='button'], input[type='button'], input[type='submit']",
        ),
      );

      for (const el of allButtons) {
        const text = (el.textContent || "").trim().toLowerCase();
        if (keywords.some((kw: string) => text.includes(kw))) {
          (el as HTMLElement).click();
        }
      }
    }, POPUP_BUTTON_KEYWORDS);

    await sleep(500);

    await page.evaluate((selectors) => {
      for (const selector of selectors) {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      }

      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }, POPUP_SELECTORS);
  } catch {}
}

export async function autoScroll(page: Page, maxScrolls = 5): Promise<void> {
  try {
    await page.evaluate(async (maxScrolls) => {
      await new Promise<void>((resolve) => {
        let totalScrolled = 0;
        let scrollCount = 0;
        const distance = 600;
        const delay = 300;

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalScrolled += distance;
          scrollCount++;

          const reachedBottom =
            totalScrolled >= document.body.scrollHeight - window.innerHeight;

          if (reachedBottom || scrollCount >= maxScrolls) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, delay);
      });
    }, maxScrolls);
  } catch {}
}

export interface CleanHtmlStats {
  scriptsRemoved: number;
  commentsRemoved: number;
  inlineEventsRemoved: number;
}

export function cleanHtml(html: string): {
  html: string;
  stats: CleanHtmlStats;
} {
  let scriptsRemoved = 0;
  let commentsRemoved = 0;
  let inlineEventsRemoved = 0;

  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    () => {
      scriptsRemoved++;
      return "";
    },
  );

  html = html.replace(/<!--[\s\S]*?-->/g, () => {
    commentsRemoved++;
    return "";
  });

  html = html.replace(/\s+on\w+="[^"]*"/gi, () => {
    inlineEventsRemoved++;
    return "";
  });
  html = html.replace(/\s+on\w+='[^']*'/gi, () => {
    inlineEventsRemoved++;
    return "";
  });

  html = html.replace(/\n\s*\n\s*\n/g, "\n\n");

  return {
    html: html.trim(),
    stats: { scriptsRemoved, commentsRemoved, inlineEventsRemoved },
  };
}

export async function waitForNetworkIdle(
  page: Page,
  timeout = 5000,
  maxInflightRequests = 0,
): Promise<void> {
  return new Promise((resolve) => {
    let inflightRequests = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_DELAY = 500;

    const done = () => {
      page.off("request", onRequest);
      page.off("response", onResponse);
      page.off("requestfailed", onResponse);
      resolve();
    };

    const checkIdle = () => {
      if (inflightRequests <= maxInflightRequests) {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(done, IDLE_DELAY);
      }
    };

    const onRequest = () => {
      inflightRequests++;
      if (idleTimer) clearTimeout(idleTimer);
    };

    const onResponse = () => {
      inflightRequests = Math.max(0, inflightRequests - 1);
      checkIdle();
    };

    page.on("request", onRequest);
    page.on("response", onResponse);
    page.on("requestfailed", onResponse);

    setTimeout(done, timeout);

    checkIdle();
  });
}

export async function waitForPageFullyRendered(
  page: Page,
  options: {
    stabilityChecks?: number;
    checkInterval?: number;
    timeout?: number;
  } = {},
): Promise<void> {
  const {
    stabilityChecks = 3,
    checkInterval = 400,
    timeout = 10_000,
  } = options;

  const startTime = Date.now();
  let stableCount = 0;
  let lastHeight = 0;
  let lastDomSize = 0;

  while (Date.now() - startTime < timeout) {
    const { height, domSize } = await page
      .evaluate(() => ({
        height: document.body?.scrollHeight ?? 0,
        domSize: document.querySelectorAll("*").length,
      }))
      .catch(() => ({ height: 0, domSize: 0 }));

    const isStable = height === lastHeight && domSize === lastDomSize;

    if (isStable && height > 0) {
      stableCount++;
      if (stableCount >= stabilityChecks) {
        return;
      }
    } else {
      stableCount = 0;
    }

    lastHeight = height;
    lastDomSize = domSize;

    await sleep(checkInterval);
  }

  console.warn(
    "[waitForPageFullyRendered] Stability timeout reached, continuing...",
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
