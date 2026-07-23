import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarSeguimientosRequest, crearSeguimientoRequest } from "../services/followUpsService";
import { DestinoSeguimiento } from "../types/follow-ups.types";

function claveDestino(destino: DestinoSeguimiento) {
  return Object.entries(destino)[0];
}

export function useSeguimientos(destino: DestinoSeguimiento) {
  const [campo, valor] = claveDestino(destino);
  return useQuery({
    queryKey: ["seguimientos", campo, valor],
    queryFn: () => listarSeguimientosRequest(destino),
    enabled: Boolean(valor),
  });
}

export function useCrearSeguimiento(destino: DestinoSeguimiento) {
  const queryClient = useQueryClient();
  const [campo, valor] = claveDestino(destino);
  return useMutation({
    mutationFn: (descripcion: string) => crearSeguimientoRequest(destino, descripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seguimientos", campo, valor] });
    },
  });
}
