import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarControlRequest,
  crearControlRequest,
  eliminarControlRequest,
  listarControlesRequest,
  obtenerControlRequest,
  obtenerHistorialControlRequest,
} from "../services/controlsService";
import { ActualizarControlInput, FiltrosControles } from "../types/controls.types";

export function useControles(filtros: FiltrosControles) {
  return useQuery({
    queryKey: ["controles", filtros],
    queryFn: () => listarControlesRequest(filtros),
  });
}

export function useControl(id: string | undefined) {
  return useQuery({
    queryKey: ["controles", id],
    queryFn: () => obtenerControlRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActualizarControlInput) => crearControlRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controles"] });
    },
  });
}

export function useActualizarControl(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActualizarControlInput) => actualizarControlRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controles"] });
      queryClient.invalidateQueries({ queryKey: ["controles", id] });
    },
  });
}

export function useEliminarControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarControlRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["controles"] });
    },
  });
}

export function useHistorialControl(id: string | undefined) {
  return useQuery({
    queryKey: ["controles", id, "historial"],
    queryFn: () => obtenerHistorialControlRequest(id as string),
    enabled: Boolean(id),
  });
}
