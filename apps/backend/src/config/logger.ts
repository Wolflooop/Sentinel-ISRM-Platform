import winston from "winston";
import { env } from "./env";

/**
 * Logger de aplicación (Winston). Uso: eventos internos, errores de negocio,
 * arranque/apagado del servidor. Los logs HTTP de acceso los maneja Morgan
 * por separado (ver middleware/requestLogger.ts).
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === "production" ? winston.format.json() : winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});
