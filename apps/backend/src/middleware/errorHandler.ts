import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { env } from "../config/env";


export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
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


export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
