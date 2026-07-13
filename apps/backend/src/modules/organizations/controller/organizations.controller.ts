import { Request, Response, NextFunction } from "express";
import {
  actualizarOrganizacionSchema,
  cambiarEstadoOrganizacionSchema,
} from "../schema/organizations.schema";
import {
  obtenerOrganizacionActual,
  actualizarOrganizacionActual,
  cambiarEstadoOrganizacionActual,
} from "../service/organizations.service";
import { toOrganizacionResponseDTO } from "../mapper/organizations.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
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
    const input = actualizarOrganizacionSchema.parse(req.body);
    const organizacion = await actualizarOrganizacionActual(organizacionIdDe(req), input);
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
    const input = cambiarEstadoOrganizacionSchema.parse(req.body);
    const organizacion = await cambiarEstadoOrganizacionActual(
      organizacionIdDe(req),
      input
    );
    res.status(200).json(toOrganizacionResponseDTO(organizacion));
  } catch (err) {
    next(err);
  }
}
