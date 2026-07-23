import { Request, Response, NextFunction } from "express";
import {
  crearCategoriaIdentificacionSchema,
  actualizarCategoriaIdentificacionSchema,
} from "../schema/risk-identification-categories.schema";
import {
  listarCategoriasIdentificacion,
  obtenerCategoriaIdentificacion,
  crearNuevaCategoriaIdentificacion,
  actualizarCategoriaIdentificacionExistente,
  eliminarCategoriaIdentificacionExistente,
} from "../service/risk-identification-categories.service";
import {
  toCategoriaIdentificacionResponseDTO,
  toCategoriaIdentificacionResponseListDTO,
} from "../mapper/risk-identification-categories.mapper";
import { AppError } from "../../../shared/AppError";

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  if (!req.user.organizacionId) {
    throw new AppError("Esta operación requiere pertenecer a una organización", 400);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarCategoriasIdentificacionController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categorias = await listarCategoriasIdentificacion();
    res.status(200).json(toCategoriaIdentificacionResponseListDTO(categorias));
  } catch (err) {
    next(err);
  }
}

export async function obtenerCategoriaIdentificacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categoria = await obtenerCategoriaIdentificacion(req.params.id);
    res.status(200).json(toCategoriaIdentificacionResponseDTO(categoria));
  } catch (err) {
    next(err);
  }
}

export async function crearCategoriaIdentificacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearCategoriaIdentificacionSchema.parse(req.body);
    const categoria = await crearNuevaCategoriaIdentificacion(input, actorDe(req));
    res.status(201).json(toCategoriaIdentificacionResponseDTO(categoria));
  } catch (err) {
    next(err);
  }
}

export async function actualizarCategoriaIdentificacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarCategoriaIdentificacionSchema.parse(req.body);
    const categoria = await actualizarCategoriaIdentificacionExistente(req.params.id, input, actorDe(req));
    res.status(200).json(toCategoriaIdentificacionResponseDTO(categoria));
  } catch (err) {
    next(err);
  }
}

export async function eliminarCategoriaIdentificacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await eliminarCategoriaIdentificacionExistente(req.params.id, actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
