import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarActivosRequest,
  listarCategoriasRequest,
  obtenerActivoRequest,
  crearActivoRequest,
  actualizarActivoRequest,
  cambiarEstadoActivoRequest,
} from "../services/assetsService";
import { FiltrosActivos } from "../types/assets.types";
import { ActivoFormValues } from "../schemas/assetsSchema";

export function useActivos(filtros: FiltrosActivos) {
  return useQuery({
    queryKey: ["activos", filtros],
    queryFn: () => listarActivosRequest(filtros),
  });
}

export function useCategoriasActivo() {
  return useQuery({
    queryKey: ["activos", "categorias"],
    queryFn: listarCategoriasRequest,
  });
}

export function useActivo(id: string | undefined) {
  return useQuery({
    queryKey: ["activos", id],
    queryFn: () => obtenerActivoRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearActivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ActivoFormValues) => crearActivoRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activos"] });
    },
  });
}

export function useActualizarActivo(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ActivoFormValues) => actualizarActivoRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activos"] });
    },
  });
}

export function useCambiarEstadoActivo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      cambiarEstadoActivoRequest(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activos"] });
    },
  });
}
