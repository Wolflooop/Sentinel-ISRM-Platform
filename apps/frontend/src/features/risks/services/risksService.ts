import { apiClient } from "../../../lib/apiClient";
import { Riesgo, FiltrosRiesgos, RiesgoHistorialEntrada, CategoriaIdentificacionRiesgo } from "../types/risks.types";
import { CrearRiesgoFormValues, AsignarResponsableFormValues } from "../schemas/risksSchema";

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

// V2 (punto 13 del prompt): endpoint dedicado para reasignar responsable.
export async function asignarResponsableRequest(
  id: string,
  input: AsignarResponsableFormValues
): Promise<Riesgo> {
  const { data } = await apiClient.post<Riesgo>(`/riesgos/${id}/responsable`, input);
  return data;
}

export async function obtenerHistorialRiesgoRequest(id: string): Promise<RiesgoHistorialEntrada[]> {
  const { data } = await apiClient.get<RiesgoHistorialEntrada[]>(`/riesgos/${id}/historial`);
  return data;
}

export async function listarCategoriasIdentificacionRequest(): Promise<CategoriaIdentificacionRiesgo[]> {
  const { data } = await apiClient.get<CategoriaIdentificacionRiesgo[]>(
    "/categorias-identificacion-riesgo"
  );
  return data;
}
