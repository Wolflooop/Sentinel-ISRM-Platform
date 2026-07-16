import { apiClient } from "../../../lib/apiClient";
import {
  ActualizarTratamientoInput,
  CrearTratamientoInput,
  FiltrosTratamientos,
  Tratamiento,
} from "../types/treatments.types";

export async function listarTratamientosRequest(
  filtros: FiltrosTratamientos = {}
): Promise<Tratamiento[]> {
  const { data } = await apiClient.get<Tratamiento[]>("/tratamientos", { params: filtros });
  return data;
}

export async function obtenerTratamientoRequest(id: string): Promise<Tratamiento> {
  const { data } = await apiClient.get<Tratamiento>(`/tratamientos/${id}`);
  return data;
}

export async function crearTratamientoRequest(input: CrearTratamientoInput): Promise<Tratamiento> {
  const { data } = await apiClient.post<Tratamiento>("/tratamientos", input);
  return data;
}

export async function actualizarTratamientoRequest(
  id: string,
  input: ActualizarTratamientoInput
): Promise<Tratamiento> {
  const { data } = await apiClient.patch<Tratamiento>(`/tratamientos/${id}`, input);
  return data;
}
