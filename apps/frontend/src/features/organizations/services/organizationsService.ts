import { apiClient } from "../../../lib/apiClient";
import { EstadoOrganizacion, Organizacion } from "../types/organizations.types";
import { ActualizarOrganizacionFormValues } from "../schemas/organizationsSchema";

export async function obtenerOrganizacionActualRequest(): Promise<Organizacion> {
  const { data } = await apiClient.get<Organizacion>("/organizaciones/actual");
  return data;
}

export async function actualizarOrganizacionActualRequest(
  input: ActualizarOrganizacionFormValues
): Promise<Organizacion> {
  const { data } = await apiClient.patch<Organizacion>("/organizaciones/actual", input);
  return data;
}

export async function cambiarEstadoOrganizacionActualRequest(
  estado: EstadoOrganizacion
): Promise<Organizacion> {
  const { data } = await apiClient.patch<Organizacion>("/organizaciones/actual/estado", {
    estado,
  });
  return data;
}
