import { Request, Response, NextFunction } from "express";
import { crearComentarioSchema, filtrosComentariosSchema } from "../schema/comments.schema";
import { listarComentarios, crearNuevoComentario } from "../service/comments.service";
import { toComentarioResponseDTO, toComentarioResponseListDTO } from "../mapper/comments.mapper";
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

export async function listarComentariosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosComentariosSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const comentarios = await listarComentarios(organizacionId, filtros);
    res.status(200).json(toComentarioResponseListDTO(comentarios));
  } catch (err) {
    next(err);
  }
}

export async function crearComentarioController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearComentarioSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const comentario = await crearNuevoComentario(organizacionId, input, actorDe(req));
    res.status(201).json(toComentarioResponseDTO(comentario));
  } catch (err) {
    next(err);
  }
}
