import { Request, Response, NextFunction } from "express";
import {
  actualizarControlSchema,
  crearControlSchema,
  filtrosControlesSchema,
} from "../schema/controls.schema";
import {
  crearNuevoControl,
  eliminarControlExistente,
  listarControles,
  obtenerControl,
  actualizarControlExistente,
} from "../service/controls.service";
import { toControlResponseDTO, toControlResponseListDTO } from "../mapper/controls.mapper";
import { AppError } from "../../../shared/AppError";

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarControlesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosControlesSchema.parse(req.query);
    const controles = await listarControles(filtros);
    res.status(200).json(toControlResponseListDTO(controles));
  } catch (err) {
    next(err);
  }
}

export async function obtenerControlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const control = await obtenerControl(req.params.id);
    res.status(200).json(toControlResponseDTO(control));
  } catch (err) {
    next(err);
  }
}

export async function crearControlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearControlSchema.parse(req.body);
    const control = await crearNuevoControl(input, actorDe(req));
    res.status(201).json(toControlResponseDTO(control));
  } catch (err) {
    next(err);
  }
}

export async function actualizarControlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarControlSchema.parse(req.body);
    const control = await actualizarControlExistente(req.params.id, input, actorDe(req));
    res.status(200).json(toControlResponseDTO(control));
  } catch (err) {
    next(err);
  }
}

export async function eliminarControlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await eliminarControlExistente(req.params.id, actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
