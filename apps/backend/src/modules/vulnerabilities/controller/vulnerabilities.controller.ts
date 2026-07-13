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

/**
 * A diferencia de threats.controller.ts, no existe `organizacionIdDe(req)`
 * para filtrar el recurso (el catálogo es global) — solo se usa para
 * atribuir la auditoría a la organización del actor.
 */
function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return {
    usuarioId: req.user.sub,
    organizacionId: req.user.organizacionId,
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
    const vulnerabilidades = await listarVulnerabilidades(filtros);
    res.status(200).json(toVulnerabilidadResponseListDTO(vulnerabilidades));
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
    const vulnerabilidad = await obtenerVulnerabilidad(req.params.id);
    res.status(200).json(toVulnerabilidadResponseDTO(vulnerabilidad));
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
    const vulnerabilidad = await crearNuevaVulnerabilidad(input, actorDe(req));
    res.status(201).json(toVulnerabilidadResponseDTO(vulnerabilidad));
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
    const vulnerabilidad = await actualizarVulnerabilidadExistente(
      req.params.id,
      input,
      actorDe(req)
    );
    res.status(200).json(toVulnerabilidadResponseDTO(vulnerabilidad));
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
    await eliminarVulnerabilidadExistente(req.params.id, actorDe(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
