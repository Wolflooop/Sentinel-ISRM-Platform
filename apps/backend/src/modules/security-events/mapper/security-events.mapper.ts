import { EventoSeguridadConUsuario } from "../types/security-events.types";
import { EventoSeguridadResponseDTO } from "../dto/security-events.dto";

export function toEventoSeguridadResponseDTO(
  evento: EventoSeguridadConUsuario
): EventoSeguridadResponseDTO {
  return {
    id: evento.id,
    evento: evento.evento,
    resultado: evento.resultado,
    severidad: evento.severidad,
    direccionIp: evento.direccionIp,
    descripcion: evento.descripcion,
    detalles: evento.detalles,
    fecha: evento.fecha.toISOString(),
    usuario: evento.usuario,
  };
}

export function toEventoSeguridadResponseListDTO(
  eventos: EventoSeguridadConUsuario[]
): EventoSeguridadResponseDTO[] {
  return eventos.map(toEventoSeguridadResponseDTO);
}
