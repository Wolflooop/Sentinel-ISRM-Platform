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

// V2: Tratamiento cuelga de Riesgo, no de Evaluacion — un riesgo puede
// tener varios tratamientos a lo largo del tiempo (ya no es 1:1).
export function useTratamientosPorRiesgo(riesgoId: string | undefined) {
  return useQuery({
    queryKey: ["tratamientos", { riesgoId }],
    queryFn: () => listarTratamientosRequest({ riesgoId }),
    enabled: Boolean(riesgoId),
  });
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
      queryClient.invalidateQueries({ queryKey: ["riesgos", tratamiento.riesgo.id] });
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
      queryClient.invalidateQueries({ queryKey: ["riesgos", tratamiento.riesgo.id] });
    },
  });
}
