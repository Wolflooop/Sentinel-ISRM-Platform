import { Request, Response, NextFunction } from "express";
import { crearEvidenciaSchema, filtrosEvidenciasSchema, validarEvidenciaSchema } from "../schema/evidence.schema";
import {
  listarEvidencias,
  crearNuevaEvidencia,
  validarEvidenciaExistente,
  obtenerRutaDescarga,
} from "../service/evidence.service";
import { toEvidenciaResponseDTO, toEvidenciaResponseListDTO } from "../mapper/evidence.mapper";
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

export async function listarEvidenciasController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosEvidenciasSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const evidencias = await listarEvidencias(organizacionId, filtros);
    res.status(200).json(toEvidenciaResponseListDTO(evidencias));
  } catch (err) {
    next(err);
  }
}

export async function crearEvidenciaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearEvidenciaSchema.parse(req.body);
    if (!req.file) {
      throw new AppError("Debe adjuntar un archivo en el campo 'archivo'", 422);
    }
    const organizacionId = organizacionIdDe(req);
    const evidencia = await crearNuevaEvidencia(
      organizacionId,
      input,
      { filename: req.file.filename, originalname: req.file.originalname },
      actorDe(req)
    );
    res.status(201).json(toEvidenciaResponseDTO(evidencia));
  } catch (err) {
    next(err);
  }
}

export async function validarEvidenciaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = validarEvidenciaSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const evidencia = await validarEvidenciaExistente(req.params.id, organizacionId, input, actorDe(req));
    res.status(200).json(toEvidenciaResponseDTO(evidencia));
  } catch (err) {
    next(err);
  }
}

export async function descargarEvidenciaController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const { ruta, nombreOriginal } = await obtenerRutaDescarga(req.params.id, organizacionId);
    res.download(ruta, nombreOriginal);
  } catch (err) {
    next(err);
  }
}
