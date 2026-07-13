import morgan, { StreamOptions } from "morgan";
import { env } from "../config/env";
import { logger } from "../config/logger";

const stream: StreamOptions = {
  write: (message) => logger.info(message.trim()),
};

/**
 * Middleware de logging HTTP (Morgan), enrutado hacia Winston para
 * mantener un único destino de logs consistente.
 */
export const requestLogger = morgan(
  env.NODE_ENV === "production" ? "combined" : "dev",
  { stream }
);
