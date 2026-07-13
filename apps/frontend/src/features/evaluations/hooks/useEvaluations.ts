import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarEvaluacionesRequest,
  obtenerEvaluacionRequest,
  crearEvaluacionRequest,
  obtenerContextoActivoRequest,
} from "../services/evaluationsService";
import { FiltrosEvaluaciones } from "../types/evaluations.types";

export function useEvaluaciones(filtros: FiltrosEvaluaciones) {
  return useQuery({
    queryKey: ["evaluaciones", filtros],
    queryFn: () => listarEvaluacionesRequest(filtros),
  });
}

export function useEvaluacion(id: string | undefined) {
  return useQuery({
    queryKey: ["evaluaciones", id],
    queryFn: () => obtenerEvaluacionRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearEvaluacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearEvaluacionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluaciones"] });
    },
  });
}

export function useContextoActivo() {
  return useQuery({
    queryKey: ["contextoActivo"],
    queryFn: obtenerContextoActivoRequest,
  });
}
