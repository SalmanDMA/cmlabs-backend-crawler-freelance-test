import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./routes";
import errorHandler from "./middlewares/errorHandler";
import { swaggerAuthMiddleware } from "./middlewares/swaggerAuth";
import { swaggerSpec } from "./docs/swagger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4100;

const allowedOrigins = [process.env.BASE_URL_FE || "http://localhost:5173"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
  max: parseInt(process.env.RATE_LIMIT_MAX || "120"),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

app.use("/api/v1", limiter);
app.use(
  "/docs",
  swaggerAuthMiddleware,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: process.env.APP_NAME || "Crawler API Docs",
  }),
);

app.use("/api/v1", apiRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  console.log(`Environment: ${process.env.ENVIRONMENT || "local"}`);
});
