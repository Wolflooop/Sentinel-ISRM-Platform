import { apiClient } from "../../../lib/apiClient";
import { ActualizarControlInput, Control, FiltrosControles } from "../types/controls.types";

export async function listarControlesRequest(filtros: FiltrosControles = {}): Promise<Control[]> {
  const { data } = await apiClient.get<Control[]>("/controles", { params: filtros });
  return data;
}

export async function obtenerControlRequest(id: string): Promise<Control> {
  const { data } = await apiClient.get<Control>(`/controles/${id}`);
  return data;
}

export async function crearControlRequest(input: ActualizarControlInput): Promise<Control> {
  const { data } = await apiClient.post<Control>("/controles", input);
  return data;
}

export async function actualizarControlRequest(
  id: string,
  input: ActualizarControlInput
): Promise<Control> {
  const { data } = await apiClient.put<Control>(`/controles/${id}`, input);
  return data;
}

export async function eliminarControlRequest(id: string): Promise<void> {
  await apiClient.delete(`/controles/${id}`);
}
