import * as dotenv from "dotenv";
import { logger } from "../utils/logger";

const envFilePath = `.env`;

dotenv.config({ path: envFilePath });

logger.app.info({
  category: "startup",
  event: "env_loaded",
  message: `Loaded environment from ${envFilePath}`,
  metadata: { envFile: envFilePath },
});
