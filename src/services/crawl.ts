import fs from "fs";
import path from "path";
import { Page } from "puppeteer";
import { browserManager } from "../utils/browserManager";
import {
  handlePopups,
  autoScroll,
  cleanHtml,
  waitForNetworkIdle,
  waitForPageFullyRendered,
  sleep,
} from "../utils/crawler";
import { withRetry } from "../utils/retry";
import { ConcurrencyLimiter } from "../utils/concurrencyLimiter";

export interface CrawlResult {
  fileName: string;
  path: string;
  url: string;
  size: string;
  crawledAt: string;
  stats: {
    scriptsRemoved: number;
    commentsRemoved: number;
    inlineEventsRemoved: number;
  };
}

const PAGE_TIMEOUT = 60_000;
const pageLimiter = new ConcurrencyLimiter(5);
const EXTRA_HEADERS: Record<string, string> = {
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
};

export class CrawlService {
  private readonly resultsDir: string;

  constructor() {
    this.resultsDir = path.join(__dirname, "../../results");
    this.ensureResultsDir();
  }

  private ensureResultsDir(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async crawl(url: string, name?: string): Promise<CrawlResult> {
    return withRetry(() => this.crawlOnce(url, name), {
      maxRetries: 2,
      delayMs: 1500,
      onRetry: (attempt, error) => {
        console.warn(
          `[CrawlService] Retry ${attempt} for ${url} — reason: ${error.message}`,
        );
      },
    });
  }

  private async crawlOnce(url: string, name?: string): Promise<CrawlResult> {
    return pageLimiter.run(async () => {
      const browser = await browserManager.getBrowser();
      const page = await browser.newPage();

      try {
        await this.setupPage(page);

        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: PAGE_TIMEOUT,
        });

        await page
          .waitForFunction(() => document.readyState === "complete", {
            timeout: 15_000,
          })
          .catch(() => {
            console.warn("[CrawlService] readyState timeout, continuing...");
          });

        await waitForNetworkIdle(page, 5_000, 2);
        await waitForPageFullyRendered(page, {
          stabilityChecks: 3,
          checkInterval: 400,
          timeout: 8_000,
        });
        await handlePopups(page);
        await autoScroll(page, 6);
        await sleep(1_000);

        const rawHtml = await page.content();
        const { html, stats } = cleanHtml(rawHtml);

        console.log(
          `[CrawlService] Clean stats — scripts: ${stats.scriptsRemoved}, ` +
            `comments: ${stats.commentsRemoved}, events: ${stats.inlineEventsRemoved}`,
        );

        const sanitizedName = this.buildFileName(name);
        const filePath = path.join(this.resultsDir, sanitizedName);
        fs.writeFileSync(filePath, html, "utf-8");

        const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(2);
        console.log(`[CrawlService] Saved → ${filePath} (${sizeKb} KB)`);

        return {
          fileName: sanitizedName,
          path: filePath,
          url,
          size: `${sizeKb} KB`,
          crawledAt: new Date().toISOString(),
          stats,
        };
      } catch (error: any) {
        console.error(`[CrawlService] Error crawling ${url}:`, error.message);
        throw new Error(error.message || "Crawl failed");
      } finally {
        try {
          await page.close();
        } catch {}
      }
    });
  }

  private async setupPage(page: Page): Promise<void> {
    const userAgent = browserManager.getRandomUserAgent();
    await page.setUserAgent(userAgent);
    await page.setViewport({ width: 1280, height: 800 });

    await page.setExtraHTTPHeaders(EXTRA_HEADERS);
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    page.setDefaultNavigationTimeout(PAGE_TIMEOUT);
    page.setDefaultTimeout(PAGE_TIMEOUT);
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "media", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  private buildFileName(name?: string): string {
    if (!name) return `crawl-${Date.now()}.html`;
    return name.endsWith(".html") ? name : `${name}.html`;
  }
}
