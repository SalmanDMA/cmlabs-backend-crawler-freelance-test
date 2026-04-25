import express from "express";
import healthRoutes from "./health";
import crawlRoutes from "./crawl";

const apiRouter = express.Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/crawl", crawlRoutes);

export default apiRouter;
