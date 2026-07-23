import { ResolucionRiesgoConRelaciones } from "../types/risk-resolutions.types";
import { ResolucionRiesgoResponseDTO } from "../dto/risk-resolutions.dto";

export function toResolucionResponseDTO(
  resolucion: ResolucionRiesgoConRelaciones
): ResolucionRiesgoResponseDTO {
  return {
    id: resolucion.id,
    riesgoId: resolucion.riesgoId,
    tipo: resolucion.tipo,
    justificacion: resolucion.justificacion,
    fecha: resolucion.fecha.toISOString(),
    usuario: resolucion.usuario,
  };
}

export function toResolucionResponseListDTO(
  resoluciones: ResolucionRiesgoConRelaciones[]
): ResolucionRiesgoResponseDTO[] {
  return resoluciones.map(toResolucionResponseDTO);
}
