import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/response";

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err.message.startsWith("CORS blocked")) {
    errorResponse(res, "CORS policy blocked this request", 403);
    return;
  }

  errorResponse(res, err.message || "Internal Server Error", 500);
};

export default errorHandler;
