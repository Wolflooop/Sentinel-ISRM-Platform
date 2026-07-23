import { Request, Response, NextFunction } from "express";
import {
  crearRiesgoSchema,
  filtrosRiesgosSchema,
  asignarResponsableSchema,
} from "../schema/risks.schema";
import {
  listarRiesgos,
  obtenerRiesgo,
  crearNuevoRiesgo,
  asignarResponsableDeRiesgo,
  obtenerHistorialDeRiesgo,
} from "../service/risks.service";
import {
  toRiesgoResponseDTO,
  toRiesgoResponseListDTO,
  toRiesgoHistorialResponseListDTO,
} from "../mapper/risks.mapper";
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

export async function asignarResponsableController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = asignarResponsableSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const riesgo = await asignarResponsableDeRiesgo(
      req.params.id,
      organizacionId,
      input.responsableId,
      actorDe(req)
    );
    res.status(200).json(toRiesgoResponseDTO(riesgo));
  } catch (err) {
    next(err);
  }
}

export async function obtenerHistorialRiesgoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const historial = await obtenerHistorialDeRiesgo(req.params.id, organizacionId);
    res.status(200).json(toRiesgoHistorialResponseListDTO(historial));
  } catch (err) {
    next(err);
  }
}
