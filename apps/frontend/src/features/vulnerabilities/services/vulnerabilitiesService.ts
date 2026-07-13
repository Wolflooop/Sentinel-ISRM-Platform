import { apiClient } from "../../../lib/apiClient";
import {
  CategoriaVulnerabilidad,
  FiltrosVulnerabilidades,
  Vulnerabilidad,
} from "../types/vulnerabilities.types";
import { VulnerabilidadFormValues } from "../schemas/vulnerabilitiesSchema";

export async function listarVulnerabilidadesRequest(
  filtros: FiltrosVulnerabilidades
): Promise<Vulnerabilidad[]> {
  const { data } = await apiClient.get<Vulnerabilidad[]>("/vulnerabilidades", { params: filtros });
  return data;
}

export async function listarCategoriasRequest(): Promise<CategoriaVulnerabilidad[]> {
  const { data } = await apiClient.get<CategoriaVulnerabilidad[]>("/vulnerabilidades/categorias");
  return data;
}

export async function obtenerVulnerabilidadRequest(id: string): Promise<Vulnerabilidad> {
  const { data } = await apiClient.get<Vulnerabilidad>(`/vulnerabilidades/${id}`);
  return data;
}

export async function crearVulnerabilidadRequest(
  input: VulnerabilidadFormValues
): Promise<Vulnerabilidad> {
  const { data } = await apiClient.post<Vulnerabilidad>("/vulnerabilidades", input);
  return data;
}

export async function actualizarVulnerabilidadRequest(
  id: string,
  input: VulnerabilidadFormValues
): Promise<Vulnerabilidad> {
  const { data } = await apiClient.patch<Vulnerabilidad>(`/vulnerabilidades/${id}`, input);
  return data;
}

export async function eliminarVulnerabilidadRequest(id: string): Promise<void> {
  await apiClient.delete(`/vulnerabilidades/${id}`);
}
