import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarComentariosRequest, crearComentarioRequest } from "../services/commentsService";
import { DestinoComentario } from "../types/comments.types";

function claveDestino(destino: DestinoComentario) {
  return Object.entries(destino)[0];
}

export function useComentarios(destino: DestinoComentario) {
  const [campo, valor] = claveDestino(destino);
  return useQuery({
    queryKey: ["comentarios", campo, valor],
    queryFn: () => listarComentariosRequest(destino),
    enabled: Boolean(valor),
  });
}

export function useCrearComentario(destino: DestinoComentario) {
  const queryClient = useQueryClient();
  const [campo, valor] = claveDestino(destino);
  return useMutation({
    mutationFn: (contenido: string) => crearComentarioRequest(destino, contenido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comentarios", campo, valor] });
    },
  });
}
