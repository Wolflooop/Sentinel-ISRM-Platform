import { Request, Response, NextFunction } from "express";
import { crearEvaluacionSchema, filtrosEvaluacionesSchema } from "../schema/evaluations.schema";
import { listarEvaluaciones, obtenerEvaluacion, crearNuevaEvaluacion } from "../service/evaluations.service";
import { toEvaluacionResponseDTO, toEvaluacionResponseListDTO } from "../mapper/evaluations.mapper";
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

export async function listarEvaluacionesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosEvaluacionesSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const evaluaciones = await listarEvaluaciones(organizacionId, filtros);
    res.status(200).json(toEvaluacionResponseListDTO(evaluaciones));
  } catch (err) {
    next(err);
  }
}

export async function obtenerEvaluacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const evaluacion = await obtenerEvaluacion(req.params.id, organizacionId);
    res.status(200).json(toEvaluacionResponseDTO(evaluacion));
  } catch (err) {
    next(err);
  }
}

export async function crearEvaluacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearEvaluacionSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const evaluacion = await crearNuevaEvaluacion(organizacionId, input, actorDe(req));
    res.status(201).json(toEvaluacionResponseDTO(evaluacion));
  } catch (err) {
    next(err);
  }
}
