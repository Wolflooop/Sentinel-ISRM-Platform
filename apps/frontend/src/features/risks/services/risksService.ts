import { apiClient } from "../../../lib/apiClient";
import { Riesgo, FiltrosRiesgos, RiesgoHistorialEntrada } from "../types/risks.types";
import { CrearRiesgoFormValues } from "../schemas/risksSchema";

export async function listarRiesgosRequest(filtros: FiltrosRiesgos): Promise<Riesgo[]> {
  const { data } = await apiClient.get<Riesgo[]>("/riesgos", { params: filtros });
  return data;
}

export async function obtenerRiesgoRequest(id: string): Promise<Riesgo> {
  const { data } = await apiClient.get<Riesgo>(`/riesgos/${id}`);
  return data;
}

export async function crearRiesgoRequest(input: CrearRiesgoFormValues): Promise<Riesgo> {
  const { data } = await apiClient.post<Riesgo>("/riesgos", input);
  return data;
}

export async function obtenerHistorialRiesgoRequest(id: string): Promise<RiesgoHistorialEntrada[]> {
  const { data } = await apiClient.get<RiesgoHistorialEntrada[]>(`/riesgos/${id}/historial`);
  return data;
}
