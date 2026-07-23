import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarEvidenciasRequest, subirEvidenciaRequest, validarEvidenciaRequest } from "../services/evidenceService";
import { DestinoEvidencia } from "../types/evidence.types";

function claveDestino(destino: DestinoEvidencia) {
  return Object.entries(destino)[0];
}

export function useEvidencias(destino: DestinoEvidencia) {
  const [campo, valor] = claveDestino(destino);
  return useQuery({
    queryKey: ["evidencias", campo, valor],
    queryFn: () => listarEvidenciasRequest(destino),
    enabled: Boolean(valor),
  });
}

export function useSubirEvidencia(destino: DestinoEvidencia) {
  const queryClient = useQueryClient();
  const [campo, valor] = claveDestino(destino);
  return useMutation({
    mutationFn: (archivo: File) => subirEvidenciaRequest(destino, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidencias", campo, valor] });
    },
  });
}

export function useValidarEvidencia(destino: DestinoEvidencia) {
  const queryClient = useQueryClient();
  const [campo, valor] = claveDestino(destino);
  return useMutation({
    mutationFn: ({ id, estado, comentario }: { id: string; estado: "VALIDADA" | "RECHAZADA"; comentario?: string }) =>
      validarEvidenciaRequest(id, estado, comentario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidencias", campo, valor] });
    },
  });
}
