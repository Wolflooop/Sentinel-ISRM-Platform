import { ControlConRelaciones } from "../types/controls.types";
import { ControlResponseDTO } from "../dto/controls.dto";

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
