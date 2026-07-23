import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarRiesgosRequest,
  obtenerRiesgoRequest,
  crearRiesgoRequest,
  asignarResponsableRequest,
  obtenerHistorialRiesgoRequest,
  listarCategoriasIdentificacionRequest,
} from "../services/risksService";
import { FiltrosRiesgos } from "../types/risks.types";
import { CrearRiesgoFormValues, AsignarResponsableFormValues } from "../schemas/risksSchema";

export function useRiesgos(filtros: FiltrosRiesgos) {
  return useQuery({
    queryKey: ["riesgos", filtros],
    queryFn: () => listarRiesgosRequest(filtros),
  });
}

export function useRiesgo(id: string | undefined) {
  return useQuery({
    queryKey: ["riesgos", id],
    queryFn: () => obtenerRiesgoRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearRiesgo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearRiesgoFormValues) => crearRiesgoRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riesgos"] });
    },
  });
}

export function useAsignarResponsable(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AsignarResponsableFormValues) =>
      asignarResponsableRequest(id as string, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riesgos"] });
      queryClient.invalidateQueries({ queryKey: ["riesgos", id] });
    },
  });
}

export function useHistorialRiesgo(id: string | undefined) {
  return useQuery({
    queryKey: ["riesgos", id, "historial"],
    queryFn: () => obtenerHistorialRiesgoRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCategoriasIdentificacion() {
  return useQuery({
    queryKey: ["categorias-identificacion-riesgo"],
    queryFn: listarCategoriasIdentificacionRequest,
  });
}
