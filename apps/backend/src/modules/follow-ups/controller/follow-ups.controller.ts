import { Request, Response, NextFunction } from "express";
import { crearSeguimientoSchema, filtrosSeguimientosSchema } from "../schema/follow-ups.schema";
import { listarSeguimientos, crearNuevoSeguimiento } from "../service/follow-ups.service";
import { toSeguimientoResponseDTO, toSeguimientoResponseListDTO } from "../mapper/follow-ups.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  if (!req.user.organizacionId) {
    throw new AppError("Esta operación requiere pertenecer a una organización", 400);
  }
  return req.user.organizacionId;
}

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return { usuarioId: req.user.sub, direccionIp: req.ip ?? "desconocida" };
}

export async function listarSeguimientosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosSeguimientosSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const seguimientos = await listarSeguimientos(organizacionId, filtros);
    res.status(200).json(toSeguimientoResponseListDTO(seguimientos));
  } catch (err) {
    next(err);
  }
}

export async function crearSeguimientoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearSeguimientoSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const seguimiento = await crearNuevoSeguimiento(organizacionId, input, actorDe(req));
    res.status(201).json(toSeguimientoResponseDTO(seguimiento));
  } catch (err) {
    next(err);
  }
}
