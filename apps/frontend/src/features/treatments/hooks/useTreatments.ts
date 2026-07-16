import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarTratamientoRequest,
  crearTratamientoRequest,
  listarTratamientosRequest,
  obtenerTratamientoRequest,
} from "../services/treatmentsService";
import { ActualizarTratamientoInput, CrearTratamientoInput, FiltrosTratamientos } from "../types/treatments.types";

export function useTratamientos(filtros: FiltrosTratamientos) {
  return useQuery({
    queryKey: ["tratamientos", filtros],
    queryFn: () => listarTratamientosRequest(filtros),
  });
}

/**
 * Un Tratamiento es 1:1 con su Evaluación (el backend rechaza con 409 un
 * segundo tratamiento para la misma evaluación — ver
 * treatments.service.ts::crearNuevoTratamiento). Se usa para decidir si la
 * evaluación en pantalla ya tiene tratamiento o falta crearlo.
 */
export function useTratamientoPorEvaluacion(evaluacionId: string | undefined) {
  const query = useQuery({
    queryKey: ["tratamientos", { evaluacionId }],
    queryFn: () => listarTratamientosRequest({ evaluacionId }),
    enabled: Boolean(evaluacionId),
  });

  return { ...query, data: query.data?.[0] };
}

export function useTratamiento(id: string | undefined) {
  return useQuery({
    queryKey: ["tratamientos", id],
    queryFn: () => obtenerTratamientoRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearTratamiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearTratamientoInput) => crearTratamientoRequest(input),
    onSuccess: (tratamiento) => {
      queryClient.invalidateQueries({ queryKey: ["tratamientos"] });
      queryClient.invalidateQueries({ queryKey: ["riesgos", tratamiento.evaluacion.riesgo.id] });
    },
  });
}

export function useActualizarTratamiento(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ActualizarTratamientoInput) => actualizarTratamientoRequest(id, input),
    onSuccess: (tratamiento) => {
      queryClient.invalidateQueries({ queryKey: ["tratamientos"] });
      queryClient.invalidateQueries({ queryKey: ["tratamientos", id] });
      queryClient.invalidateQueries({ queryKey: ["riesgos", tratamiento.evaluacion.riesgo.id] });
    },
  });
}
