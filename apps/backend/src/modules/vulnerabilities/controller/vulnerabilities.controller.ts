import { Request, Response, NextFunction } from "express";
import {
  crearVulnerabilidadSchema,
  actualizarVulnerabilidadSchema,
  filtrosVulnerabilidadesSchema,
} from "../schema/vulnerabilities.schema";
import {
  listarVulnerabilidades,
  listarCategorias,
  obtenerVulnerabilidad,
  crearNuevaVulnerabilidad,
  actualizarVulnerabilidadExistente,
  eliminarVulnerabilidadExistente,
} from "../service/vulnerabilities.service";
import {
  toVulnerabilidadResponseDTO,
  toVulnerabilidadResponseListDTO,
  toCategoriaVulnerabilidadResponseListDTO,
} from "../mapper/vulnerabilities.mapper";
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
  const organizacionId = organizacionIdDe(req);
  return {
    usuarioId: req.user!.sub,
    organizacionId,
    direccionIp: req.ip ?? "desconocida",
  };
}

export async function listarVulnerabilidadesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filtros = filtrosVulnerabilidadesSchema.parse(req.query);
    const organizacionId = organizacionIdDe(req);
    const vulnerabilidades = await listarVulnerabilidades(organizacionId, filtros);
    res.status(200).json(toVulnerabilidadResponseListDTO(vulnerabilidades, organizacionId));
  } catch (err) {
    next(err);
  }
}

export async function listarCategoriasController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categorias = await listarCategorias();
    res.status(200).json(toCategoriaVulnerabilidadResponseListDTO(categorias));
  } catch (err) {
    next(err);
  }
}

export async function obtenerVulnerabilidadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    const vulnerabilidad = await obtenerVulnerabilidad(req.params.id, organizacionId);
    res.status(200).json(toVulnerabilidadResponseDTO(vulnerabilidad, organizacionId));
  } catch (err) {
    next(err);
  }
}

export async function crearVulnerabilidadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearVulnerabilidadSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const vulnerabilidad = await crearNuevaVulnerabilidad(organizacionId, input, actorDe(req));
    res.status(201).json(toVulnerabilidadResponseDTO(vulnerabilidad, organizacionId));
  } catch (err) {
    next(err);
  }
}

export async function actualizarVulnerabilidadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarVulnerabilidadSchema.parse(req.body);
    const organizacionId = organizacionIdDe(req);
    const vulnerabilidad = await actualizarVulnerabilidadExistente(
      req.params.id,
      organizacionId,
      input,
      actorDe(req)
    );
    res.status(200).json(toVulnerabilidadResponseDTO(vulnerabilidad, organizacionId));
  } catch (err) {
    next(err);
  }
}

export async function eliminarVulnerabilidadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizacionId = organizacionIdDe(req);
    await eliminarVulnerabilidadExistente(req.params.id, organizacionId, actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
