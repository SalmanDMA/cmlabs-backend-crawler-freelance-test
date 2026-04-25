import { Router } from "express";
import { healthController } from "../controllers/health";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check application health
 *     description: Returns detailed health information including system resources, memory, CPU, and app metadata.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     app:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Crawler APP
 *                         version:
 *                           type: string
 *                           example: 1.0.0
 *                         environment:
 *                           type: string
 *                           example: local
 *                         port:
 *                           type: integer
 *                           example: 4100
 *                     uptime:
 *                       type: object
 *                       properties:
 *                         seconds:
 *                           type: integer
 *                           example: 3600
 *                         human:
 *                           type: string
 *                           example: 0d 1h 0m 0s
 *                     process:
 *                       type: object
 *                       properties:
 *                         pid:
 *                           type: integer
 *                         nodeVersion:
 *                           type: string
 *                         platform:
 *                           type: string
 *                         arch:
 *                           type: string
 *                     memory:
 *                       type: object
 *                       properties:
 *                         process:
 *                           type: object
 *                         system:
 *                           type: object
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         model:
 *                           type: string
 *                         cores:
 *                           type: integer
 *                         loadAverage:
 *                           type: array
 *                           items:
 *                             type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get("/", healthController);

export default router;
