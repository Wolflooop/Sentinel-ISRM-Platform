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

/**
 * Punto único desde el que middleware/servicios de autenticación registran
 * un evento de seguridad. Nadie fuera de este módulo debe importar
 * `security-events.repository` directamente (requisito aprobado: "evitar
 * acceso directo desde middleware a repository").
 *
 * Principio no negociable (aprobado en Fase 3): registrar un evento de
 * seguridad NUNCA debe bloquear ni romper el flujo de autenticación/
 * autorización real. Si la escritura falla (p. ej. la base de datos no
 * responde), el error se captura y se deja constancia en el logger de
 * aplicación (Winston, ya existente) — pero se traga aquí. La respuesta
 * 401/403/200 al cliente sigue su curso normal sin depender de este
 * resultado. Un fallo en la bitácora de seguridad no puede convertirse en un
 * nuevo vector de denegación de servicio.
 */
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
