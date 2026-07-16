import { Request, Response, NextFunction } from "express";
import { AppError } from "../../../shared/AppError";
import { filtrosAuditoriaSchema } from "../schema/audit.schema";
import { listarRegistrosAuditoria, obtenerRegistroAuditoria } from "../service/audit.service";
import { toRegistroAuditoriaResponseDTO, toRegistroAuditoriaResponseListDTO } from "../mapper/audit.mapper";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return req.user.organizacionId;
}

export async function listarRegistrosAuditoriaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosAuditoriaSchema.parse(req.query);
    const registros = await listarRegistrosAuditoria(organizacionIdDe(req), filtros);
    res.status(200).json(toRegistroAuditoriaResponseListDTO(registros));
  } catch (err) {
    next(err);
  }
}

export async function obtenerRegistroAuditoriaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const registro = await obtenerRegistroAuditoria(req.params.id, organizacionIdDe(req));
    res.status(200).json(toRegistroAuditoriaResponseDTO(registro));
  } catch (err) {
    next(err);
  }
}
