import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { env } from "../config/env";

/**
 * Middleware global de manejo de errores.
 *
 * Nota de alcance (Fase 1): esta es la infraestructura genérica de captura de
 * errores. Códigos de error de negocio específicos por módulo (p. ej. reglas
 * ISO/IEC 27005) se definirán en sus fases correspondientes, no aquí.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Error de validación",
      detalles: err.flatten().fieldErrors,
    });
    return;
  }

  const status =
    typeof err === "object" && err !== null && "status" in err
      ? Number((err as { status: unknown }).status) || 500
      : 500;

  const message =
    err instanceof Error ? err.message : "Error interno del servidor";

  logger.error(message, { path: req.path, method: req.method, error: err });

  res.status(status).json({
    error: status === 500 ? "Error interno del servidor" : message,
    ...(env.NODE_ENV !== "production" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}

/**
 * Middleware para rutas no encontradas (404). Debe registrarse después de
 * todas las rutas y antes del errorHandler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
