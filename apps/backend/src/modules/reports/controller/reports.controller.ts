import { Request, Response, NextFunction } from "express";
import { generarReporteSchema, filtrosReportesSchema } from "../schema/reports.schema";
import {
  generarReporteNuevo,
  listarReportesDeOrganizacion,
  obtenerRutaDescarga,
} from "../service/reports.service";
import { toReporteResponseDTO, toReporteResponseListDTO } from "../mapper/reports.mapper";
import { AppError } from "../../../shared/AppError";

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  if (!req.user.organizacionId) {
    throw new AppError("Esta operación requiere pertenecer a una organización", 400);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
    // tipoRol viene del JWT vía middleware `authenticate` existente (mismo
    // patrón que ya usan risks/treatments/evidence controllers) — no se
    // toca el middleware, solo se lee el campo que ya está en req.user.
    tipoRol: req.user.tipoRol,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function generarReporteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = generarReporteSchema.parse(req.body);
    const reporte = await generarReporteNuevo(input, actorDe(req));
    res.status(201).json(toReporteResponseDTO(reporte));
  } catch (err) {
    next(err);
  }
}

export async function listarReportesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosReportesSchema.parse(req.query);
    const actor = actorDe(req);
    const reportes = await listarReportesDeOrganizacion({
      organizacionId: actor.organizacionId,
      tipo: filtros.tipo,
    });
    res.status(200).json(toReporteResponseListDTO(reportes));
  } catch (err) {
    next(err);
  }
}

export async function descargarReporteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const actor = actorDe(req);
    const { rutaAbsoluta, nombreDescarga } = await obtenerRutaDescarga(
      req.params.id,
      actor.organizacionId
    );
    res.download(rutaAbsoluta, nombreDescarga);
  } catch (err) {
    next(err);
  }
}
