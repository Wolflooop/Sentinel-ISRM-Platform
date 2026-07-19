import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  obtenerOrganizacionActualRequest,
  actualizarOrganizacionActualRequest,
  cambiarEstadoOrganizacionActualRequest,
  listarOrganizacionesRequest,
  crearOrganizacionRequest,
} from "../services/organizationsService";
import {
  ActualizarOrganizacionFormValues,
  CrearOrganizacionFormValues,
} from "../schemas/organizationsSchema";
import { EstadoOrganizacion } from "../types/organizations.types";

const QUERY_KEY = ["organizacion-actual"];
const LISTA_QUERY_KEY = ["organizaciones"];

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

// A partir de aquí: exclusivo del Administrador Principal (SUPER_ADMIN).
// El backend rechaza estas llamadas (403) para cualquier otro rol, así que
// el frontend solo debe montar estos hooks detrás de una comprobación de
// esSuperAdminActual().
export function useOrganizaciones(enabled = true) {
  return useQuery({
    queryKey: LISTA_QUERY_KEY,
    queryFn: listarOrganizacionesRequest,
    enabled,
  });
}

export function useCrearOrganizacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearOrganizacionFormValues) => crearOrganizacionRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTA_QUERY_KEY });
    },
  });
}
