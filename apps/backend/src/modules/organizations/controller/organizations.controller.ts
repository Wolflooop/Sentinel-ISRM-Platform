import { Request, Response, NextFunction } from "express";
import {
  actualizarOrganizacionSchema,
  cambiarEstadoOrganizacionSchema,
  crearOrganizacionSchema,
} from "../schema/organizations.schema";
import {
  obtenerOrganizacionActual,
  actualizarOrganizacionActual,
  cambiarEstadoOrganizacionActual,
  crearNuevaOrganizacion,
  listarOrganizaciones,
} from "../service/organizations.service";
import { toOrganizacionResponseDTO } from "../mapper/organizations.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  if (!req.user.organizacionId) {
    // Un SUPER_ADMIN no tiene "organización actual": debe usar los
    // endpoints de administración global (crear/listar organizaciones).
    throw new AppError("Esta operación requiere pertenecer a una organización", 400);
  }
  return req.user.organizacionId;
}

export async function obtenerOrganizacionActualController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacion = await obtenerOrganizacionActual(organizacionIdDe(req));
    res.status(200).json(toOrganizacionResponseDTO(organizacion));
  } catch (err) {
    next(err);
  }
}

export async function actualizarOrganizacionActualController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }
    const input = actualizarOrganizacionSchema.parse(req.body);
    const organizacion = await actualizarOrganizacionActual(organizacionIdDe(req), input, {
      usuarioId: req.user.sub,
      direccionIp: req.ip ?? "desconocida",
    });
    res.status(200).json(toOrganizacionResponseDTO(organizacion));
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoOrganizacionActualController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }
    const input = cambiarEstadoOrganizacionSchema.parse(req.body);
    const organizacion = await cambiarEstadoOrganizacionActual(
      organizacionIdDe(req),
      input,
      {
        usuarioId: req.user.sub,
        direccionIp: req.ip ?? "desconocida",
      }
    );
    res.status(200).json(toOrganizacionResponseDTO(organizacion));
  } catch (err) {
    next(err);
  }
}

// A partir de aquí: solo accesible para SUPER_ADMIN (ver
// organizations.routes.ts — requireTipoRol("SUPER_ADMIN")).

export async function crearOrganizacionController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }
    const input = crearOrganizacionSchema.parse(req.body);
    const organizacion = await crearNuevaOrganizacion(input, {
      usuarioId: req.user.sub,
      direccionIp: req.ip ?? "desconocida",
    });
    res.status(201).json(toOrganizacionResponseDTO(organizacion));
  } catch (err) {
    next(err);
  }
}

export async function listarOrganizacionesController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizaciones = await listarOrganizaciones();
    res.status(200).json(organizaciones.map(toOrganizacionResponseDTO));
  } catch (err) {
    next(err);
  }
}
