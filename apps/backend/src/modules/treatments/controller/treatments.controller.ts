import { Request, Response, NextFunction } from "express";
import {
  actualizarTratamientoSchema,
  crearTratamientoSchema,
  filtrosTratamientosSchema,
} from "../schema/treatments.schema";
import {
  crearNuevoTratamiento,
  listarTratamientos,
  obtenerTratamiento,
  actualizarTratamientoExistente,
} from "../service/treatments.service";
import { toTratamientoResponseDTO, toTratamientoResponseListDTO } from "../mapper/treatments.mapper";
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

export async function listarTratamientosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosTratamientosSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const tratamientos = await listarTratamientos(organizacionId, filtros);
    res.status(200).json(toTratamientoResponseListDTO(tratamientos));
  } catch (err) {
    next(err);
  }
}

export async function obtenerTratamientoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const tratamiento = await obtenerTratamiento(req.params.id, organizacionId);
    res.status(200).json(toTratamientoResponseDTO(tratamiento));
  } catch (err) {
    next(err);
  }
}

export async function crearTratamientoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearTratamientoSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const tratamiento = await crearNuevoTratamiento(organizacionId, input, actorDe(req));
    res.status(201).json(toTratamientoResponseDTO(tratamiento));
  } catch (err) {
    next(err);
  }
}

export async function actualizarTratamientoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarTratamientoSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const tratamiento = await actualizarTratamientoExistente(req.params.id, organizacionId, input, actorDe(req));
    res.status(200).json(toTratamientoResponseDTO(tratamiento));
  } catch (err) {
    next(err);
  }
}
