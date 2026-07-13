import { Request, Response, NextFunction } from "express";
import {
  crearContextoSchema,
  actualizarContextoSchema,
  reemplazarEscalaSchema,
  reemplazarMatrizSchema,
} from "../schema/context.schema";
import {
  listarContextos,
  obtenerContexto,
  obtenerContextoActivo,
  crearNuevoContexto,
  actualizarContextoExistente,
  reemplazarEscalaImpacto,
  reemplazarEscalaProbabilidad,
  reemplazarMatrizRiesgo,
  activarContexto,
} from "../service/context.service";
import {
  toContextoResponseDTO,
  toContextoResponseListDTO,
  toContextoDetalleResponseDTO,
} from "../mapper/context.mapper";
import { AppError } from "../../../shared/AppError";

function organizacionIdDe(req: Request): string {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return req.user.organizacionId;
}

function actorDe(req: Request) {
  if (!req.user) {
    throw new AppError("No autenticado", 401);
  }
  return { usuarioId: req.user.sub, direccionIp: req.ip ?? "desconocida" };
}

export async function listarContextosController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contextos = await listarContextos(organizacionIdDe(req));
    res.status(200).json(toContextoResponseListDTO(contextos));
  } catch (err) {
    next(err);
  }
}

export async function obtenerContextoActivoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contexto = await obtenerContextoActivo(organizacionIdDe(req));
    res.status(200).json(contexto ? toContextoDetalleResponseDTO(contexto) : null);
  } catch (err) {
    next(err);
  }
}

export async function obtenerContextoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contexto = await obtenerContexto(req.params.id, organizacionIdDe(req));
    res.status(200).json(toContextoDetalleResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function crearContextoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = crearContextoSchema.parse(req.body);
    const contexto = await crearNuevoContexto(organizacionIdDe(req), input, actorDe(req));
    res.status(201).json(toContextoResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function actualizarContextoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = actualizarContextoSchema.parse(req.body);
    const contexto = await actualizarContextoExistente(
      req.params.id,
      organizacionIdDe(req),
      input,
      actorDe(req)
    );
    res.status(200).json(toContextoResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function reemplazarEscalaImpactoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = reemplazarEscalaSchema.parse(req.body);
    await reemplazarEscalaImpacto(req.params.id, organizacionIdDe(req), input, actorDe(req));
    const contexto = await obtenerContexto(req.params.id, organizacionIdDe(req));
    res.status(200).json(toContextoDetalleResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function reemplazarEscalaProbabilidadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = reemplazarEscalaSchema.parse(req.body);
    await reemplazarEscalaProbabilidad(req.params.id, organizacionIdDe(req), input, actorDe(req));
    const contexto = await obtenerContexto(req.params.id, organizacionIdDe(req));
    res.status(200).json(toContextoDetalleResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function reemplazarMatrizController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = reemplazarMatrizSchema.parse(req.body);
    await reemplazarMatrizRiesgo(req.params.id, organizacionIdDe(req), input, actorDe(req));
    const contexto = await obtenerContexto(req.params.id, organizacionIdDe(req));
    res.status(200).json(toContextoDetalleResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}

export async function activarContextoController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const contexto = await activarContexto(req.params.id, organizacionIdDe(req), actorDe(req));
    res.status(200).json(toContextoResponseDTO(contexto));
  } catch (err) {
    next(err);
  }
}
