import { SeguimientoConRelaciones } from "../types/follow-ups.types";
import { SeguimientoResponseDTO } from "../dto/follow-ups.dto";

export function toSeguimientoResponseDTO(seguimiento: SeguimientoConRelaciones): SeguimientoResponseDTO {
  return {
    id: seguimiento.id,
    riesgoId: seguimiento.riesgoId,
    tratamientoId: seguimiento.tratamientoId,
    controlId: seguimiento.controlId,
    descripcion: seguimiento.descripcion,
    fecha: seguimiento.fecha.toISOString(),
    usuario: seguimiento.usuario,
  };
}

export function toSeguimientoResponseListDTO(seguimientos: SeguimientoConRelaciones[]): SeguimientoResponseDTO[] {
  return seguimientos.map(toSeguimientoResponseDTO);
}
