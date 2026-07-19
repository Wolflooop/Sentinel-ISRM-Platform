import { apiClient } from "../../../lib/apiClient";
import { Rol } from "../types/roles.types";

export async function listarRolesRequest(): Promise<Rol[]> {
  const { data } = await apiClient.get<Rol[]>("/roles");
  return data;
}
