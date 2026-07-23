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
  obtenerHistorialDeControl,
} from "../service/controls.service";
import {
  toControlResponseDTO,
  toControlResponseListDTO,
  toControlHistorialResponseListDTO,
} from "../mapper/controls.mapper";
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
    organizacionId: organizacionIdDe(req),
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
    const controles = await listarControles(organizacionIdDe(req), filtros);
    res.status(200).json(toControlResponseListDTO(controles, organizacionIdDe(req)));
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
    const control = await obtenerControl(req.params.id, organizacionIdDe(req));
    res.status(200).json(toControlResponseDTO(control, organizacionIdDe(req)));
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
    const control = await crearNuevoControl(organizacionIdDe(req), input, actorDe(req));
    res.status(201).json(toControlResponseDTO(control, organizacionIdDe(req)));
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
    const control = await actualizarControlExistente(
      req.params.id,
      organizacionIdDe(req),
      input,
      actorDe(req)
    );
    res.status(200).json(toControlResponseDTO(control, organizacionIdDe(req)));
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
    await eliminarControlExistente(req.params.id, organizacionIdDe(req), actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function obtenerHistorialControlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const historial = await obtenerHistorialDeControl(req.params.id, organizacionIdDe(req));
    res.status(200).json(toControlHistorialResponseListDTO(historial));
  } catch (err) {
    next(err);
  }
}
