import { apiClient } from "../../../lib/apiClient";
import { Contexto, ContextoDetalle } from "../types/context.types";
import {
  CrearContextoFormValues,
  EditarContextoFormValues,
  EscalaFormValues,
  MatrizFormValues,
} from "../schemas/contextSchema";

export async function listarContextosRequest(): Promise<Contexto[]> {
  const { data } = await apiClient.get<Contexto[]>("/contexto");
  return data;
}

export async function obtenerContextoActivoRequest(): Promise<ContextoDetalle | null> {
  const { data } = await apiClient.get<ContextoDetalle | null>("/contexto/activo");
  return data;
}

export async function obtenerContextoRequest(id: string): Promise<ContextoDetalle> {
  const { data } = await apiClient.get<ContextoDetalle>(`/contexto/${id}`);
  return data;
}

export async function crearContextoRequest(input: CrearContextoFormValues): Promise<Contexto> {
  const { data } = await apiClient.post<Contexto>("/contexto", input);
  return data;
}

export async function actualizarContextoRequest(
  id: string,
  input: EditarContextoFormValues
): Promise<Contexto> {
  const { data } = await apiClient.patch<Contexto>(`/contexto/${id}`, input);
  return data;
}

export async function reemplazarEscalaImpactoRequest(
  id: string,
  input: EscalaFormValues
): Promise<ContextoDetalle> {
  const { data } = await apiClient.put<ContextoDetalle>(`/contexto/${id}/escalas-impacto`, input);
  return data;
}

export async function reemplazarEscalaProbabilidadRequest(
  id: string,
  input: EscalaFormValues
): Promise<ContextoDetalle> {
  const { data } = await apiClient.put<ContextoDetalle>(
    `/contexto/${id}/escalas-probabilidad`,
    input
  );
  return data;
}

export async function reemplazarMatrizRequest(
  id: string,
  input: MatrizFormValues
): Promise<ContextoDetalle> {
  const { data } = await apiClient.put<ContextoDetalle>(`/contexto/${id}/matriz`, input);
  return data;
}

export async function activarContextoRequest(id: string): Promise<Contexto> {
  const { data } = await apiClient.post<Contexto>(`/contexto/${id}/activar`, {});
  return data;
}
