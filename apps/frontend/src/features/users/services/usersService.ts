import { apiClient } from "../../../lib/apiClient";
import { Usuario } from "../types/users.types";
import { CrearUsuarioFormValues, EditarUsuarioFormValues } from "../schemas/usersSchema";

export async function listarUsuariosRequest(): Promise<Usuario[]> {
  const { data } = await apiClient.get<Usuario[]>("/usuarios");
  return data;
}

export async function obtenerUsuarioRequest(id: string): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
  return data;
}

export async function crearUsuarioRequest(input: CrearUsuarioFormValues): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>("/usuarios", input);
  return data;
}

export async function actualizarUsuarioRequest(
  id: string,
  input: EditarUsuarioFormValues
): Promise<Usuario> {
  const { data } = await apiClient.patch<Usuario>(`/usuarios/${id}`, input);
  return data;
}

export async function cambiarEstadoUsuarioRequest(
  id: string,
  activo: boolean
): Promise<Usuario> {
  const { data } = await apiClient.patch<Usuario>(`/usuarios/${id}/estado`, { activo });
  return data;
}
