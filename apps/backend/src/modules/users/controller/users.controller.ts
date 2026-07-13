import { Request, Response, NextFunction } from "express";
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  cambiarEstadoUsuarioSchema,
} from "../schema/users.schema";
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuarioEnOrganizacion,
  actualizarUsuarioEnOrganizacion,
  cambiarEstadoUsuarioEnOrganizacion,
} from "../service/users.service";
import { toUsuarioResponseDTO, toUsuarioResponseListDTO } from "../mapper/users.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return req.user.organizacionId;
}

export async function listarUsuariosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuarios = await listarUsuarios(organizacionIdDe(req));
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
    const usuario = await obtenerUsuario(req.params.id, organizacionIdDe(req));
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
    const usuario = await crearUsuarioEnOrganizacion(organizacionIdDe(req), input);
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
    const usuario = await actualizarUsuarioEnOrganizacion(
      req.params.id,
      organizacionIdDe(req),
      input
    );
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
    const usuario = await cambiarEstadoUsuarioEnOrganizacion(
      req.params.id,
      organizacionIdDe(req),
      input.activo
    );
    res.status(200).json(toUsuarioResponseDTO(usuario));
  } catch (err) {
    next(err);
  }
}
