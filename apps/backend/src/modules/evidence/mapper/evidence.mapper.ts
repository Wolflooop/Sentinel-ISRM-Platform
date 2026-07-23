import { EvidenciaConRelaciones } from "../types/evidence.types";
import { EvidenciaResponseDTO } from "../dto/evidence.dto";

// rutaArchivo (la ubicación física en disco) nunca se expone al cliente —
// la descarga del archivo se hace vía el endpoint dedicado
// GET /evidencias/:id/descargar, que resuelve la ruta internamente.
export function toEvidenciaResponseDTO(evidencia: EvidenciaConRelaciones): EvidenciaResponseDTO {
  return {
    id: evidencia.id,
    riesgoId: evidencia.riesgoId,
    tratamientoId: evidencia.tratamientoId,
    controlId: evidencia.controlId,
    nombreArchivo: evidencia.nombreArchivo,
    estado: evidencia.estado,
    comentarioValidacion: evidencia.comentarioValidacion,
    creadoEn: evidencia.creadoEn.toISOString(),
    subidoPor: evidencia.subidoPor,
    validadoPor: evidencia.validadoPor,
  };
}

export function toEvidenciaResponseListDTO(evidencias: EvidenciaConRelaciones[]): EvidenciaResponseDTO[] {
  return evidencias.map(toEvidenciaResponseDTO);
}
