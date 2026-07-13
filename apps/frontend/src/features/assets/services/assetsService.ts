import { apiClient } from "../../../lib/apiClient";
import { Activo, CategoriaActivo, FiltrosActivos } from "../types/assets.types";
import { ActivoFormValues } from "../schemas/assetsSchema";

export async function listarActivosRequest(filtros: FiltrosActivos): Promise<Activo[]> {
  const { data } = await apiClient.get<Activo[]>("/activos", { params: filtros });
  return data;
}

export async function listarCategoriasRequest(): Promise<CategoriaActivo[]> {
  const { data } = await apiClient.get<CategoriaActivo[]>("/activos/categorias");
  return data;
}

export async function obtenerActivoRequest(id: string): Promise<Activo> {
  const { data } = await apiClient.get<Activo>(`/activos/${id}`);
  return data;
}

export async function crearActivoRequest(input: ActivoFormValues): Promise<Activo> {
  const { data } = await apiClient.post<Activo>("/activos", input);
  return data;
}

export async function actualizarActivoRequest(
  id: string,
  input: ActivoFormValues
): Promise<Activo> {
  const { data } = await apiClient.patch<Activo>(`/activos/${id}`, input);
  return data;
}

export async function cambiarEstadoActivoRequest(id: string, estado: string): Promise<Activo> {
  const { data } = await apiClient.patch<Activo>(`/activos/${id}/estado`, { estado });
  return data;
}
