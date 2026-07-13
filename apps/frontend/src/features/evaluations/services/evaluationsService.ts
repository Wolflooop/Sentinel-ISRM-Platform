import { apiClient } from "../../../lib/apiClient";
import { Evaluacion, CrearEvaluacionFormValues, FiltrosEvaluaciones } from "../types/evaluations.types";

export async function listarEvaluacionesRequest(filtros: FiltrosEvaluaciones): Promise<Evaluacion[]> {
  const { data } = await apiClient.get<Evaluacion[]>("/evaluaciones", { params: filtros });
  return data;
}

export async function obtenerEvaluacionRequest(id: string): Promise<Evaluacion> {
  const { data } = await apiClient.get<Evaluacion>(`/evaluaciones/${id}`);
  return data;
}

export async function crearEvaluacionRequest(input: CrearEvaluacionFormValues): Promise<Evaluacion> {
  const { data } = await apiClient.post<Evaluacion>("/evaluaciones", input);
  return data;
}

export async function obtenerContextoActivoRequest(): Promise<{ id: string; activo: boolean }> {
  const { data } = await apiClient.get<{ id: string; activo: boolean }>("/contexto/activo");
  return data;
}
