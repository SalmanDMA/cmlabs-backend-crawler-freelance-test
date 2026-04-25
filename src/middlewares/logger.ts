import { ErrorRequestHandler, RequestHandler } from "express";
import winston from "winston";
import expressWinston from "express-winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const logDir = process.env.LOG_DIR
  ? path.resolve(process.env.LOG_DIR)
  : path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const requestLogger: RequestHandler = expressWinston.logger({
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "request-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "100d",
      zippedArchive: true,
    }),
  ],
  format: baseFormat,
});

export const errorLogger: ErrorRequestHandler = expressWinston.errorLogger({
  transports: [
    new DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "100d",
      zippedArchive: true,
    }),
  ],
  format: baseFormat,
});
