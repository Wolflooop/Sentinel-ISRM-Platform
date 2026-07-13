import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarUsuariosRequest,
  obtenerUsuarioRequest,
  crearUsuarioRequest,
  actualizarUsuarioRequest,
  cambiarEstadoUsuarioRequest,
} from "../services/usersService";
import { CrearUsuarioFormValues, EditarUsuarioFormValues } from "../schemas/usersSchema";

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: listarUsuariosRequest,
  });
}

export function useUsuario(id: string | undefined) {
  return useQuery({
    queryKey: ["usuarios", id],
    queryFn: () => obtenerUsuarioRequest(id as string),
    enabled: Boolean(id),
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearUsuarioFormValues) => crearUsuarioRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function useActualizarUsuario(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EditarUsuarioFormValues) => actualizarUsuarioRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      cambiarEstadoUsuarioRequest(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
