import { Request, Response, NextFunction } from "express";
import { crearResolucionSchema, filtrosResolucionesSchema } from "../schema/risk-resolutions.schema";
import { listarResoluciones, crearNuevaResolucion } from "../service/risk-resolutions.service";
import { toResolucionResponseDTO, toResolucionResponseListDTO } from "../mapper/risk-resolutions.mapper";
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
  return {
    usuarioId: req.user.sub,
    tipoRol: req.user.tipoRol,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarResolucionesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosResolucionesSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const resoluciones = await listarResoluciones(organizacionId, filtros);
    res.status(200).json(toResolucionResponseListDTO(resoluciones));
  } catch (err) {
    next(err);
  }
}

export async function crearResolucionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearResolucionSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const resolucion = await crearNuevaResolucion(organizacionId, input, actorDe(req));
    res.status(201).json(toResolucionResponseDTO(resolucion));
  } catch (err) {
    next(err);
  }
}
