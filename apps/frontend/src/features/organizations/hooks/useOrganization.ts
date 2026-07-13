import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  obtenerOrganizacionActualRequest,
  actualizarOrganizacionActualRequest,
  cambiarEstadoOrganizacionActualRequest,
} from "../services/organizationsService";
import { ActualizarOrganizacionFormValues } from "../schemas/organizationsSchema";
import { EstadoOrganizacion } from "../types/organizations.types";

const QUERY_KEY = ["organizacion-actual"];

export function useOrganizacionActual() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: obtenerOrganizacionActualRequest,
  });
}

export function useActualizarOrganizacionActual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ActualizarOrganizacionFormValues) =>
      actualizarOrganizacionActualRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useCambiarEstadoOrganizacionActual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (estado: EstadoOrganizacion) =>
      cambiarEstadoOrganizacionActualRequest(estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
