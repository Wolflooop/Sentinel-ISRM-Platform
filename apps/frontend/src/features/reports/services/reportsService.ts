import { apiClient } from "../../../lib/apiClient";
import { FiltrosReportes, GenerarReporteInput, Reporte } from "../types/reports.types";

export async function listarReportesRequest(filtros: FiltrosReportes = {}): Promise<Reporte[]> {
  const { data } = await apiClient.get<Reporte[]>("/reportes", { params: filtros });
  return data;
}

export async function generarReporteRequest(input: GenerarReporteInput): Promise<Reporte> {
  const { data } = await apiClient.post<Reporte>("/reportes", input);
  return data;
}

/**
 * Descarga el PDF del reporte y dispara la descarga en el navegador.
 * No usa <a href> directo porque la petición requiere el header
 * Authorization (JWT) inyectado por apiClient.
 */
export async function descargarReporteRequest(reporte: Reporte): Promise<void> {
  const response = await apiClient.get(`/reportes/${reporte.id}/descargar`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `sentinel-isrm_${reporte.tipo.toLowerCase()}_${reporte.fecha.slice(0, 10)}.pdf`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}
