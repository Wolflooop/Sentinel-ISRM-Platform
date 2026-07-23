import { apiClient } from "../../../lib/apiClient";
import { ResolucionRiesgo, TipoResolucionRiesgo } from "../types/risk-resolutions.types";

export async function listarResolucionesRequest(riesgoId: string): Promise<ResolucionRiesgo[]> {
  const { data } = await apiClient.get<ResolucionRiesgo[]>("/resoluciones-riesgo", {
    params: { riesgoId },
  });
  return data;
}

export async function crearResolucionRequest(
  riesgoId: string,
  tipo: TipoResolucionRiesgo,
  justificacion: string
): Promise<ResolucionRiesgo> {
  const { data } = await apiClient.post<ResolucionRiesgo>("/resoluciones-riesgo", {
    riesgoId,
    tipo,
    justificacion,
  });
  return data;
}
