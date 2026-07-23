import { apiClient } from "../../../lib/apiClient";
import { Comentario, DestinoComentario } from "../types/comments.types";

export async function listarComentariosRequest(destino: DestinoComentario): Promise<Comentario[]> {
  const { data } = await apiClient.get<Comentario[]>("/comentarios", { params: destino });
  return data;
}

export async function crearComentarioRequest(
  destino: DestinoComentario,
  contenido: string
): Promise<Comentario> {
  const { data } = await apiClient.post<Comentario>("/comentarios", { ...destino, contenido });
  return data;
}
