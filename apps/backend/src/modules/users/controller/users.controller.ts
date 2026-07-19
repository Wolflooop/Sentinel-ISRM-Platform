import { Request, Response, NextFunction } from "express";
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  cambiarEstadoUsuarioSchema,
} from "../schema/users.schema";
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuarioComoActor,
  actualizarUsuarioComoActor,
  cambiarEstadoUsuarioComoActor,
  ActorUsuarios,
} from "../service/users.service";
import { toUsuarioResponseDTO, toUsuarioResponseListDTO } from "../mapper/users.mapper";
import { AppError } from "../../../shared/AppError";

// El actor SIEMPRE se construye a partir de req.user (JWT verificado por
// `authenticate`). Nunca se lee organizacionId/tipoRol del body ni de query
// params: eso es exactamente lo que permitiría a un usuario auto-asignarse
// otra organización o un rol superior.
function actorDe(req: Request): ActorUsuarios {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
    tipoRol: req.user.tipoRol,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarUsuariosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuarios = await listarUsuarios(actorDe(req));
    res.status(200).json(toUsuarioResponseListDTO(usuarios));
  } catch (err) {
    next(err);
  }
}

export async function obtenerUsuarioController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = await obtenerUsuario(req.params.id, actorDe(req));
    res.status(200).json(toUsuarioResponseDTO(usuario));
  } catch (err) {
    next(err);
  }
}

export async function crearUsuarioController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearUsuarioSchema.parse(req.body);
    const usuario = await crearUsuarioComoActor(actorDe(req), input);
    res.status(201).json(toUsuarioResponseDTO(usuario));
  } catch (err) {
    next(err);
  }
}

export async function actualizarUsuarioController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarUsuarioSchema.parse(req.body);
    const usuario = await actualizarUsuarioComoActor(req.params.id, actorDe(req), input);
    res.status(200).json(toUsuarioResponseDTO(usuario));
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoUsuarioController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = cambiarEstadoUsuarioSchema.parse(req.body);
    const usuario = await cambiarEstadoUsuarioComoActor(
      req.params.id,
      actorDe(req),
      input.activo
    );
    res.status(200).json(toUsuarioResponseDTO(usuario));
  } catch (err) {
    next(err);
  }
}
