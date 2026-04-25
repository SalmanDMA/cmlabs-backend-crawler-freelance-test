import { Request, Response } from "express";
import { CrawlService } from "../services/crawl";
import { successResponse, errorResponse } from "../utils/response";
import fs from "fs";
import path from "path";

const crawlService = new CrawlService();
const RESULTS_DIR = path.join(__dirname, "../../results");

export const crawlController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { url, name } = req.body;

  if (!url) {
    errorResponse(res, "URL is required", 400);
    return;
  }

  try {
    new URL(url);
  } catch {
    errorResponse(res, "Invalid URL format", 400);
    return;
  }

  try {
    const result = await crawlService.crawl(url, name);
    successResponse(res, "Crawl success", 200, result);
  } catch (error: any) {
    errorResponse(res, error.message || "Failed to crawl the URL", 500);
  }
};

export const previewController = (req: Request, res: Response): void => {
  const filename = req.params["filename"] as string;
  const safeName = path.basename(filename);

  if (!safeName.endsWith(".html")) {
    res
      .status(400)
      .json({ success: false, message: "Only .html files are allowed" });
    return;
  }

  const filePath = path.join(RESULTS_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: "File not found" });
    return;
  }

  const html = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(200).send(html);
};

export const downloadController = (req: Request, res: Response): void => {
  const filename = req.params["filename"] as string;
  const safeName = path.basename(filename);

  if (!safeName.endsWith(".html")) {
    res
      .status(400)
      .json({ success: false, message: "Only .html files are allowed" });
    return;
  }

  const filePath = path.join(RESULTS_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: "File not found" });
    return;
  }

  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.sendFile(filePath);
};
