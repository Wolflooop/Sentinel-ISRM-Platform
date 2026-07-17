import { logger } from "../../../config/logger";
import { AppError } from "../../../shared/AppError";
import {
  crearEventoSeguridad,
  findEventoSeguridadPorId,
  findEventosSeguridad,
} from "../repository/security-events.repository";
import {
  EventoSeguridadConUsuario,
  FiltrosEventosSeguridad,
  RegistrarEventoSeguridadParams,
} from "../types/security-events.types";


export async function registrarEventoSeguridad(
  params: RegistrarEventoSeguridadParams
): Promise<void> {
  try {
    await crearEventoSeguridad(params);
  } catch (err) {
    logger.error("No se pudo registrar el evento de seguridad", {
      evento: params.evento,
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function listarEventosSeguridad(
  organizacionId: string,
  filtros: FiltrosEventosSeguridad
): Promise<EventoSeguridadConUsuario[]> {
  return findEventosSeguridad(organizacionId, filtros);
}

export async function obtenerEventoSeguridad(
  id: string,
  organizacionId: string
): Promise<EventoSeguridadConUsuario> {
  const evento = await findEventoSeguridadPorId(id, organizacionId);
  if (!evento) {
    throw new AppError("Evento de seguridad no encontrado", 404);
  }
  return evento;
}
