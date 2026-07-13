import { Request, Response, NextFunction } from "express";
import { crearRiesgoSchema, filtrosRiesgosSchema } from "../schema/risks.schema";
import { listarRiesgos, obtenerRiesgo, crearNuevoRiesgo } from "../service/risks.service";
import { toRiesgoResponseDTO, toRiesgoResponseListDTO } from "../mapper/risks.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return req.user.organizacionId;
}

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return { usuarioId: req.user.sub, direccionIp: req.ip ?? "desconocida" };
}

export async function listarRiesgosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosRiesgosSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const riesgos = await listarRiesgos(organizacionId, filtros);
    res.status(200).json(toRiesgoResponseListDTO(riesgos));
  } catch (err) {
    next(err);
  }
}

export async function obtenerRiesgoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const riesgo = await obtenerRiesgo(req.params.id, organizacionId);
    res.status(200).json(toRiesgoResponseDTO(riesgo));
  } catch (err) {
    next(err);
  }
}

export async function crearRiesgoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearRiesgoSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const riesgo = await crearNuevoRiesgo(organizacionId, input, actorDe(req));
    res.status(201).json(toRiesgoResponseDTO(riesgo));
  } catch (err) {
    next(err);
  }
}
