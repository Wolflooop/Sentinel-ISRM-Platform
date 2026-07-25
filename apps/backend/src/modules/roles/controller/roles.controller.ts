import { Request, Response, NextFunction } from "express";
import {
  crearRolSchema,
  actualizarRolSchema,
  asignarPermisoSchema,
} from "../schema/roles.schema";
import {
  listarRoles,
  obtenerRol,
  obtenerRolConPermisos,
  crearNuevoRol,
  actualizarRolExistente,
  asignarPermiso,
  quitarPermiso,
} from "../service/roles.service";
import {
  toRolResponseDTO,
  toRolResponseListDTO,
  toRolConPermisosResponseDTO,
} from "../mapper/roles.mapper";
import { ActorRoles } from "../types/roles.types";
import { AppError } from "../../../shared/AppError";

// El actor SIEMPRE se construye a partir de req.user (JWT verificado por
// `authenticate`), nunca del body/params: mismo patrón que
// users.controller.ts. organizacionId puede llegar null (SUPER_ADMIN); el
// service resuelve ese caso a la organización técnica de auditoría.
function actorDe(req: Request): ActorRoles {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarRolesController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const roles = await listarRoles();
    res.status(200).json(toRolResponseListDTO(roles));
  } catch (err) {
    next(err);
  }
}

export async function obtenerRolController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rol = await obtenerRol(req.params.id);
    res.status(200).json(toRolResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}

export async function obtenerPermisosDeRolController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rol = await obtenerRolConPermisos(req.params.id);
    res.status(200).json(toRolConPermisosResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}

export async function crearRolController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearRolSchema.parse(req.body);
    const rol = await crearNuevoRol(input, actorDe(req));
    res.status(201).json(toRolResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}

export async function actualizarRolController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarRolSchema.parse(req.body);
    const rol = await actualizarRolExistente(req.params.id, input, actorDe(req));
    res.status(200).json(toRolResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}

export async function asignarPermisoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = asignarPermisoSchema.parse(req.body);
    const rol = await asignarPermiso(req.params.id, input.permisoId, actorDe(req));
    res.status(201).json(toRolConPermisosResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}

export async function quitarPermisoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rol = await quitarPermiso(req.params.id, req.params.permisoId, actorDe(req));
    res.status(200).json(toRolConPermisosResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}
