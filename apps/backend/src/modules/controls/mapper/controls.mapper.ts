import { ControlConRelaciones } from "../types/controls.types";
import { ControlHistorialEntrada } from "../../history/types/history.types";
import { ControlResponseDTO, ControlHistorialResponseDTO } from "../dto/controls.dto";

/**
 * Prisma Model → Mapper → DTO. Requiere `organizacionId` del solicitante
 * (no del control) para poder derivar `esPropia` sin exponer
 * `organizacionId` crudo en la respuesta — mismo criterio que
 * threats.mapper.ts.
 */
export function toControlResponseDTO(
  control: ControlConRelaciones,
  organizacionIdSolicitante: string
): ControlResponseDTO {
  return {
    id: control.id,
    esPropia: control.organizacionId === organizacionIdSolicitante,
    codigoIso27001: control.codigoIso27001,
    nombre: control.nombre,
    tipo: control.tipo,
    estadoImplementacion: control.estadoImplementacion,
    fechaImplementacion: control.fechaImplementacion ? control.fechaImplementacion.toISOString() : null,
    observaciones: control.observaciones,
    descripcionImplementacion: control.descripcionImplementacion,
    organizacion: control.organizacion
      ? {
          id: control.organizacion.id,
          nombre: control.organizacion.nombre,
        }
      : null,
  };
}

export function toControlResponseListDTO(
  controles: ControlConRelaciones[],
  organizacionIdSolicitante: string
): ControlResponseDTO[] {
  return controles.map((control) => toControlResponseDTO(control, organizacionIdSolicitante));
}

export function toControlHistorialResponseDTO(
  entrada: ControlHistorialEntrada
): ControlHistorialResponseDTO {
  return {
    id: entrada.id,
    estadoAnterior: entrada.estadoAnterior,
    estadoNuevo: entrada.estadoNuevo,
    comentario: entrada.comentario,
    createdAt: entrada.createdAt.toISOString(),
    usuario: {
      id: entrada.usuario.id,
      nombre: entrada.usuario.nombre,
      rol: entrada.usuario.rol.nombre,
    },
  };
}

export function toControlHistorialResponseListDTO(
  entradas: ControlHistorialEntrada[]
): ControlHistorialResponseDTO[] {
  return entradas.map(toControlHistorialResponseDTO);
}
