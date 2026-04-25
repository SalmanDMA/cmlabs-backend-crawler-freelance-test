import { Request, Response, NextFunction } from "express";

export const swaggerAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
    res.status(401).send("Unauthorized: Access to Swagger docs is restricted.");
    return;
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const [username, password] = credentials.split(":");

  const expectedUsername = process.env.SWAGGER_USERNAME || "developer";
  const expectedPassword = process.env.SWAGGER_PASSWORD || "password";

  if (username === expectedUsername && password === expectedPassword) {
    next();
    return;
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="Swagger Docs"');
  res.status(401).send("Unauthorized: Invalid credentials.");
};
