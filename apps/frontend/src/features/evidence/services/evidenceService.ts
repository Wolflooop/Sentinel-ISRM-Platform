import { apiClient } from "../../../lib/apiClient";
import { Evidencia, DestinoEvidencia } from "../types/evidence.types";

export async function listarEvidenciasRequest(destino: DestinoEvidencia): Promise<Evidencia[]> {
  const { data } = await apiClient.get<Evidencia[]>("/evidencias", { params: destino });
  return data;
}

export async function subirEvidenciaRequest(
  destino: DestinoEvidencia,
  archivo: File
): Promise<Evidencia> {
  const formData = new FormData();
  Object.entries(destino).forEach(([clave, valor]) => formData.append(clave, valor as string));
  formData.append("archivo", archivo);

  const { data } = await apiClient.post<Evidencia>("/evidencias", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function validarEvidenciaRequest(
  id: string,
  estado: "VALIDADA" | "RECHAZADA",
  comentarioValidacion?: string
): Promise<Evidencia> {
  const { data } = await apiClient.patch<Evidencia>(`/evidencias/${id}/validar`, {
    estado,
    comentarioValidacion,
  });
  return data;
}

export function urlDescargaEvidencia(id: string): string {
  return `/evidencias/${id}/descargar`;
}
