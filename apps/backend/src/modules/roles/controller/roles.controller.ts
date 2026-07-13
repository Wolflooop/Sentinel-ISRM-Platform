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
    const rol = await crearNuevoRol(input);
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
    const rol = await actualizarRolExistente(req.params.id, input);
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
    const rol = await asignarPermiso(req.params.id, input.permisoId);
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
    const rol = await quitarPermiso(req.params.id, req.params.permisoId);
    res.status(200).json(toRolConPermisosResponseDTO(rol));
  } catch (err) {
    next(err);
  }
}
