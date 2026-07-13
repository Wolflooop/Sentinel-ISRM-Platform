import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarVulnerabilidadesRequest,
  listarCategoriasRequest,
  obtenerVulnerabilidadRequest,
  crearVulnerabilidadRequest,
  actualizarVulnerabilidadRequest,
  eliminarVulnerabilidadRequest,
} from "../services/vulnerabilitiesService";
import { FiltrosVulnerabilidades } from "../types/vulnerabilities.types";
import { VulnerabilidadFormValues } from "../schemas/vulnerabilitiesSchema";

export function useVulnerabilidades(filtros: FiltrosVulnerabilidades) {
  return useQuery({
    queryKey: ["vulnerabilidades", filtros],
    queryFn: () => listarVulnerabilidadesRequest(filtros),
  });
}

export function useCategoriasVulnerabilidad() {
  return useQuery({
    queryKey: ["vulnerabilidades", "categorias"],
    queryFn: listarCategoriasRequest,
  });
}

export function useVulnerabilidad(id: string | undefined) {
  return useQuery({
    queryKey: ["vulnerabilidades", id],
    queryFn: () => obtenerVulnerabilidadRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearVulnerabilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VulnerabilidadFormValues) => crearVulnerabilidadRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vulnerabilidades"] });
    },
  });
}

export function useActualizarVulnerabilidad(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VulnerabilidadFormValues) => actualizarVulnerabilidadRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vulnerabilidades"] });
    },
  });
}

export function useEliminarVulnerabilidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarVulnerabilidadRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vulnerabilidades"] });
    },
  });
}
