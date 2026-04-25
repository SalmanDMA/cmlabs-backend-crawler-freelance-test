import { Request, Response } from "express";
import os from "os";
import { successResponse } from "../utils/response";

export const healthController = (_req: Request, res: Response): void => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  const healthData = {
    status: "ok",
    app: {
      name: process.env.APP_NAME || "Crawler APP",
      version: process.env.NPM_PACKAGE_VERSION || "1.0.0",
      environment: process.env.ENVIRONMENT || "local",
      port: process.env.PORT || 4100,
    },
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    memory: {
      process: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
        external: formatBytes(memoryUsage.external),
      },
      system: {
        total: formatBytes(totalMemory),
        free: formatBytes(freeMemory),
        used: formatBytes(totalMemory - freeMemory),
        usagePercent: `${(((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2)}%`,
      },
    },
    cpu: {
      model: os.cpus()[0]?.model || "Unknown",
      cores: os.cpus().length,
      loadAverage: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
    },
    timestamp: new Date().toISOString(),
  };

  successResponse(res, "Service is healthy", 200, healthData);
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}
