import morgan, { StreamOptions } from "morgan";
import { env } from "../config/env";
import { logger } from "../config/logger";

const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
};


export const requestLogger = morgan(
  env.NODE_ENV === "production" ? "combined" : "dev",
  { stream }
);
