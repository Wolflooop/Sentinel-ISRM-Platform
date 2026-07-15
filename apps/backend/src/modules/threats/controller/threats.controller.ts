import { Request, Response, NextFunction } from "express";
import {
  crearAmenazaSchema,
  actualizarAmenazaSchema,
  filtrosAmenazasSchema,
} from "../schema/threats.schema";
import {
  listarAmenazas,
  listarCategorias,
  obtenerAmenaza,
  crearNuevaAmenaza,
  actualizarAmenazaExistente,
  eliminarAmenazaExistente,
} from "../service/threats.service";
import {
  toAmenazaResponseDTO,
  toAmenazaResponseListDTO,
  toCategoriaAmenazaResponseListDTO,
} from "../mapper/threats.mapper";
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

export async function listarAmenazasController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosAmenazasSchema.parse(req.query);
    const amenazas = await listarAmenazas(organizacionIdDe(req), filtros);
    res.status(200).json(toAmenazaResponseListDTO(amenazas, organizacionIdDe(req)));
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
    res.status(200).json(toCategoriaAmenazaResponseListDTO(categorias));
  } catch (err) {
    next(err);
  }
}

export async function obtenerAmenazaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const amenaza = await obtenerAmenaza(req.params.id, organizacionIdDe(req));
    res.status(200).json(toAmenazaResponseDTO(amenaza, organizacionIdDe(req)));
  } catch (err) {
    next(err);
  }
}

export async function crearAmenazaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearAmenazaSchema.parse(req.body);
    const amenaza = await crearNuevaAmenaza(organizacionIdDe(req), input, actorDe(req));
    res.status(201).json(toAmenazaResponseDTO(amenaza, organizacionIdDe(req)));
  } catch (err) {
    next(err);
  }
}

export async function actualizarAmenazaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarAmenazaSchema.parse(req.body);
    const amenaza = await actualizarAmenazaExistente(
      req.params.id,
      organizacionIdDe(req),
      input,
      actorDe(req)
    );
    res.status(200).json(toAmenazaResponseDTO(amenaza, organizacionIdDe(req)));
  } catch (err) {
    next(err);
  }
}

export async function eliminarAmenazaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await eliminarAmenazaExistente(req.params.id, organizacionIdDe(req), actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
