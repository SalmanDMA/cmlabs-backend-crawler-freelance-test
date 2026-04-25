import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        username: string;
        roleId: string;
        roleName: string;
        lastModuleId: string;
        lastModuleName: string;
        lastAppId: string;
        lastAppName: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY);
    } catch (error: any) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      username: decoded.username,
      roleId: decoded.roleId,
      roleName: decoded.roleName,
      lastModuleId: decoded.lastModuleId,
      lastModuleName: decoded.lastModuleName,
      lastAppId: decoded.lastAppId,
      lastAppName: decoded.lastAppName,
    };
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication failure" });
  }
};
