import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarContextosRequest,
  obtenerContextoActivoRequest,
  obtenerContextoRequest,
  crearContextoRequest,
  actualizarContextoRequest,
  reemplazarEscalaImpactoRequest,
  reemplazarEscalaProbabilidadRequest,
  reemplazarMatrizRequest,
  activarContextoRequest,
} from "../services/contextService";
import {
  CrearContextoFormValues,
  EditarContextoFormValues,
  EscalaFormValues,
  MatrizFormValues,
} from "../schemas/contextSchema";

export function useContextos() {
  return useQuery({
    queryKey: ["contextos"],
    queryFn: listarContextosRequest,
  });
}

export function useContextoActivo() {
  return useQuery({
    queryKey: ["contextos", "activo"],
    queryFn: obtenerContextoActivoRequest,
  });
}

export function useContexto(id: string | undefined) {
  return useQuery({
    queryKey: ["contextos", id],
    queryFn: () => obtenerContextoRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearContexto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearContextoFormValues) => crearContextoRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contextos"] });
    },
  });
}

export function useActualizarContexto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EditarContextoFormValues) => actualizarContextoRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contextos"] });
      queryClient.invalidateQueries({ queryKey: ["contextos", id] });
    },
  });
}

function invalidarContexto(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: ["contextos", id] });
  queryClient.invalidateQueries({ queryKey: ["contextos", "activo"] });
  queryClient.invalidateQueries({ queryKey: ["contextos"] });
}

export function useReemplazarEscalaImpacto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EscalaFormValues) => reemplazarEscalaImpactoRequest(id, input),
    onSuccess: () => invalidarContexto(queryClient, id),
  });
}

export function useReemplazarEscalaProbabilidad(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EscalaFormValues) => reemplazarEscalaProbabilidadRequest(id, input),
    onSuccess: () => invalidarContexto(queryClient, id),
  });
}

export function useReemplazarMatriz(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MatrizFormValues) => reemplazarMatrizRequest(id, input),
    onSuccess: () => invalidarContexto(queryClient, id),
  });
}

export function useActivarContexto(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activarContextoRequest(id),
    onSuccess: () => invalidarContexto(queryClient, id),
  });
}
