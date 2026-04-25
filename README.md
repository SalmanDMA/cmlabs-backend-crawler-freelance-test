# Crawler API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> REST API for crawling websites (SPA, SSR, PWA) using Puppeteer — saves fully-rendered HTML to disk.

---

## Overview

Crawler API is a backend service that crawls any website and captures the fully rendered HTML, including pages built with React, Vue, Next.js, and other modern frameworks.

**Features:**

- SPA / SSR / PWA support via Puppeteer (waits for JS to fully render)
- Anti-bot handling — real browser-like headers, removes `navigator.webdriver`
- Generic SPA stability detection via DOM size polling
- Auto retry (max 2x) with delay on failure
- Concurrency limiter (max 5 pages open simultaneously)
- Preserved `<style>` tags for accurate HTML preview
- Swagger UI at `/docs` (protected by Basic Auth)
- Rate limiting, structured logging, health check endpoint

---

## Tech Stack

| Layer     | Tech                                |
| --------- | ----------------------------------- |
| Runtime   | Node.js 18+                         |
| Language  | TypeScript 5.x                      |
| Framework | Express 5.x                         |
| Browser   | Puppeteer (Chromium)                |
| Docs      | swagger-jsdoc + swagger-ui-express  |
| Logging   | Winston + winston-daily-rotate-file |
| Security  | Helmet, CORS, express-rate-limit    |

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Thin functional controllers
│   ├── services/
│   │   └── crawl.ts        # CrawlService — core crawl logic
│   ├── routes/             # Express routers + Swagger JSDoc
│   ├── middlewares/        # Error handler, Swagger Basic Auth
│   ├── utils/
│   │   ├── browserManager.ts    # Puppeteer browser instance
│   │   ├── crawler.ts           # Scroll, popup, clean, SPA wait
│   │   ├── concurrencyLimiter.ts
│   │   ├── retry.ts
│   │   └── response.ts
│   └── index.ts
├── results/                # Saved HTML output files
├── logs/
├── .env.example
└── package.json
```

---

## Getting Started

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

```env
PORT=4100
ENVIRONMENT=local
APP_NAME="Crawler APP"
BASE_URL_FE=http://localhost:3000
BASE_URL_API=http://localhost:4100/api/v1
APP_VERSION=/api/v1
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
LOG_DIR=./logs
SWAGGER_USERNAME=developer
SWAGGER_PASSWORD=password
```

**3. Run**

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

API: `http://localhost:4100`  
Swagger: `http://localhost:4100/docs`

---

## API Endpoints

| Method | Endpoint                           | Description                   |
| ------ | ---------------------------------- | ----------------------------- |
| `GET`  | `/api/v1/health`                   | System health check           |
| `POST` | `/api/v1/crawl`                    | Crawl a URL and save HTML     |
| `GET`  | `/api/v1/crawl/preview/:filename`  | Preview saved HTML in browser |
| `GET`  | `/api/v1/crawl/download/:filename` | Download saved HTML file      |

**Crawl request example:**

```json
POST /api/v1/crawl
{
  "url": "https://cmlabs.co",
  "name": "cmlabs"
}
```

---

## Author

**Salman Dwi Maulana Akbar** — Fullstack Developer  
GitHub: [https://github.com/SalmanDMA](https://github.com/SalmanDMA)
