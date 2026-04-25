import { Router } from "express";
import {
  crawlController,
  previewController,
  downloadController,
} from "../controllers/crawl";

const router = Router();

/**
 * @swagger
 * /crawl:
 *   post:
 *     summary: Crawl a website and save HTML
 *     description: Crawls a given URL using Puppeteer (supports SPA, SSR, PWA). Browser instance is reused across requests for performance.
 *     tags: [Crawler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://cmlabs.co
 *               name:
 *                 type: string
 *                 description: Optional output filename (without .html)
 *                 example: cmlabs
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                       example: cmlabs.html
 *                     path:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: string
 *                       example: 142.50 KB
 *                     crawledAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", crawlController);

/**
 * @swagger
 * /crawl/preview/{filename}:
 *   get:
 *     summary: Preview a crawled HTML file in browser
 *     tags: [Crawler]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         example: cmlabs.html
 *     responses:
 *       200:
 *         description: HTML file content
 *       404:
 *         description: File not found
 */
router.get("/preview/:filename", previewController);

/**
 * @swagger
 * /crawl/download/{filename}:
 *   get:
 *     summary: Download a crawled HTML file
 *     tags: [Crawler]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         example: cmlabs.html
 *     responses:
 *       200:
 *         description: HTML file download
 *       404:
 *         description: File not found
 */
router.get("/download/:filename", downloadController);

export default router;
