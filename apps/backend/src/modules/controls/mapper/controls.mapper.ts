import { ControlConRelaciones } from "../types/controls.types";
import { ControlResponseDTO } from "../dto/controls.dto";

export function toControlResponseDTO(control: ControlConRelaciones): ControlResponseDTO {
  return {
    id: control.id,
    organizacionId: control.organizacionId,
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

export function toControlResponseListDTO(controles: ControlConRelaciones[]): ControlResponseDTO[] {
  return controles.map(toControlResponseDTO);
}
