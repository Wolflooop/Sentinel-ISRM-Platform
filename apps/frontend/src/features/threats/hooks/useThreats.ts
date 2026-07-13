import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarAmenazasRequest,
  listarCategoriasRequest,
  obtenerAmenazaRequest,
  crearAmenazaRequest,
  actualizarAmenazaRequest,
  eliminarAmenazaRequest,
} from "../services/threatsService";
import { FiltrosAmenazas } from "../types/threats.types";
import { AmenazaFormValues } from "../schemas/threatsSchema";

export function useAmenazas(filtros: FiltrosAmenazas) {
  return useQuery({
    queryKey: ["amenazas", filtros],
    queryFn: () => listarAmenazasRequest(filtros),
  });
}

export function useCategoriasAmenaza() {
  return useQuery({
    queryKey: ["amenazas", "categorias"],
    queryFn: listarCategoriasRequest,
  });
}

export function useAmenaza(id: string | undefined) {
  return useQuery({
    queryKey: ["amenazas", id],
    queryFn: () => obtenerAmenazaRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearAmenaza() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AmenazaFormValues) => crearAmenazaRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenazas"] });
    },
  });
}

export function useActualizarAmenaza(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AmenazaFormValues) => actualizarAmenazaRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenazas"] });
    },
  });
}

export function useEliminarAmenaza() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarAmenazaRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenazas"] });
    },
  });
}
