import { ReporteConRelaciones } from "../types/reports.types";
import { ReporteResponseDTO } from "../dto/reports.dto";

export function toReporteResponseDTO(
  reporte: ReporteConRelaciones
): ReporteResponseDTO {
  return {
    id: reporte.id,
    organizacionId: reporte.organizacionId,
    tipo: reporte.tipo,
    formato: reporte.formato,
    fecha: reporte.fecha.toISOString(),
    usuario: {
      id: reporte.usuario.id,
      nombre: reporte.usuario.nombre,
    },
  };
}

export function toReporteResponseListDTO(
  reportes: ReporteConRelaciones[]
): ReporteResponseDTO[] {
  return reportes.map(toReporteResponseDTO);
}
