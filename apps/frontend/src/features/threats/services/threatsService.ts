import { apiClient } from "../../../lib/apiClient";
import { Amenaza, CategoriaAmenaza, FiltrosAmenazas } from "../types/threats.types";
import { AmenazaFormValues } from "../schemas/threatsSchema";

export async function listarAmenazasRequest(filtros: FiltrosAmenazas): Promise<Amenaza[]> {
  const { data } = await apiClient.get<Amenaza[]>("/amenazas", { params: filtros });
  return data;
}

export async function listarCategoriasRequest(): Promise<CategoriaAmenaza[]> {
  const { data } = await apiClient.get<CategoriaAmenaza[]>("/amenazas/categorias");
  return data;
}

export async function obtenerAmenazaRequest(id: string): Promise<Amenaza> {
  const { data } = await apiClient.get<Amenaza>(`/amenazas/${id}`);
  return data;
}

export async function crearAmenazaRequest(input: AmenazaFormValues): Promise<Amenaza> {
  const { data } = await apiClient.post<Amenaza>("/amenazas", input);
  return data;
}

export async function actualizarAmenazaRequest(
  id: string,
  input: AmenazaFormValues
): Promise<Amenaza> {
  const { data } = await apiClient.patch<Amenaza>(`/amenazas/${id}`, input);
  return data;
}

export async function eliminarAmenazaRequest(id: string): Promise<void> {
  await apiClient.delete(`/amenazas/${id}`);
}
