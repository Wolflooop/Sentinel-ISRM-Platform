import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/AppError";
import { filtrosEventosSeguridadSchema } from "../schema/security-events.schema";
import { listarEventosSeguridad, obtenerEventoSeguridad } from "../service/security-events.service";
import {
  toEventoSeguridadResponseDTO,
  toEventoSeguridadResponseListDTO,
} from "../mapper/security-events.mapper";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  if (!req.user.organizacionId) {
    // Un SUPER_ADMIN (organizacionId = null) no opera sobre datos de
    // gestión de riesgos: ese dominio pertenece siempre a una organización.
    throw new AppError("Esta operación requiere pertenecer a una organización", 400);
  }
  return req.user.organizacionId;
}

export async function listarEventosSeguridadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosEventosSeguridadSchema.parse(req.query);
    const eventos = await listarEventosSeguridad(organizacionIdDe(req), filtros);
    res.status(200).json(toEventoSeguridadResponseListDTO(eventos));
  } catch (err) {
    next(err);
  }
}

export async function obtenerEventoSeguridadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const evento = await obtenerEventoSeguridad(req.params.id, organizacionIdDe(req));
    res.status(200).json(toEventoSeguridadResponseDTO(evento));
  } catch (err) {
    next(err);
  }
}
