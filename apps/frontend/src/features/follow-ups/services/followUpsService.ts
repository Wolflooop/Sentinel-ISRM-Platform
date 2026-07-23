import { apiClient } from "../../../lib/apiClient";
import { Seguimiento, DestinoSeguimiento } from "../types/follow-ups.types";

export async function listarSeguimientosRequest(destino: DestinoSeguimiento): Promise<Seguimiento[]> {
  const { data } = await apiClient.get<Seguimiento[]>("/seguimientos", { params: destino });
  return data;
}

export async function crearSeguimientoRequest(
  destino: DestinoSeguimiento,
  descripcion: string
): Promise<Seguimiento> {
  const { data } = await apiClient.post<Seguimiento>("/seguimientos", { ...destino, descripcion });
  return data;
}
