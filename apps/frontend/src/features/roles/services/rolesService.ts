import { apiClient } from "../../../lib/apiClient";
import { Rol, RolConPermisos, Permiso } from "../types/roles.types";
import { EditarRolFormValues } from "../schemas/rolesSchema";

export async function listarRolesRequest(): Promise<Rol[]> {
  const { data } = await apiClient.get<Rol[]>("/roles");
  return data;
}

export async function obtenerRolConPermisosRequest(id: string): Promise<RolConPermisos> {
  const { data } = await apiClient.get<RolConPermisos>(`/roles/${id}/permisos`);
  return data;
}

export async function actualizarRolRequest(
  id: string,
  input: EditarRolFormValues
): Promise<Rol> {
  const { data } = await apiClient.patch<Rol>(`/roles/${id}`, input);
  return data;
}

export async function asignarPermisoRequest(
  rolId: string,
  permisoId: string
): Promise<RolConPermisos> {
  const { data } = await apiClient.post<RolConPermisos>(`/roles/${rolId}/permisos`, {
    permisoId,
  });
  return data;
}

export async function quitarPermisoRequest(
  rolId: string,
  permisoId: string
): Promise<RolConPermisos> {
  const { data } = await apiClient.delete<RolConPermisos>(
    `/roles/${rolId}/permisos/${permisoId}`
  );
  return data;
}

// Catálogo de permisos disponibles (endpoint /api/permisos, ya existente) —
// se consume desde aquí para la pantalla de asignación, sin crear un feature
// independiente de "permissions" en el frontend.
export async function listarPermisosDisponiblesRequest(): Promise<Permiso[]> {
  const { data } = await apiClient.get<Permiso[]>("/permisos");
  return data;
}
