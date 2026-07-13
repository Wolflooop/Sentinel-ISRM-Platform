import { Request, Response, NextFunction } from "express";
import {
  crearActivoSchema,
  actualizarActivoSchema,
  cambiarEstadoActivoSchema,
  filtrosActivosSchema,
} from "../schema/assets.schema";
import {
  listarActivos,
  listarCategorias,
  obtenerActivo,
  crearNuevoActivo,
  actualizarActivoExistente,
  cambiarEstadoActivoExistente,
} from "../service/assets.service";
import {
  toActivoResponseDTO,
  toActivoResponseListDTO,
  toCategoriaActivoResponseListDTO,
} from "../mapper/assets.mapper";
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

export async function listarActivosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosActivosSchema.parse(req.query);
    const activos = await listarActivos(organizacionIdDe(req), filtros);
    res.status(200).json(toActivoResponseListDTO(activos));
  } catch (err) {
    next(err);
  }
}

export async function listarCategoriasController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categorias = await listarCategorias();
    res.status(200).json(toCategoriaActivoResponseListDTO(categorias));
  } catch (err) {
    next(err);
  }
}

export async function obtenerActivoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const activo = await obtenerActivo(req.params.id, organizacionIdDe(req));
    res.status(200).json(toActivoResponseDTO(activo));
  } catch (err) {
    next(err);
  }
}

export async function crearActivoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearActivoSchema.parse(req.body);
    const activo = await crearNuevoActivo(organizacionIdDe(req), input, actorDe(req));
    res.status(201).json(toActivoResponseDTO(activo));
  } catch (err) {
    next(err);
  }
}

export async function actualizarActivoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarActivoSchema.parse(req.body);
    const activo = await actualizarActivoExistente(
      req.params.id,
      organizacionIdDe(req),
      input,
      actorDe(req)
    );
    res.status(200).json(toActivoResponseDTO(activo));
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoActivoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = cambiarEstadoActivoSchema.parse(req.body);
    const activo = await cambiarEstadoActivoExistente(
      req.params.id,
      organizacionIdDe(req),
      input.estado,
      actorDe(req)
    );
    res.status(200).json(toActivoResponseDTO(activo));
  } catch (err) {
    next(err);
  }
}
