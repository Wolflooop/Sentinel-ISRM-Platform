import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarRolesRequest,
  obtenerRolConPermisosRequest,
  actualizarRolRequest,
  asignarPermisoRequest,
  quitarPermisoRequest,
  listarPermisosDisponiblesRequest,
} from "../services/rolesService";
import { EditarRolFormValues } from "../schemas/rolesSchema";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: listarRolesRequest,
  });
}

export function useRolConPermisos(rolId: string | undefined) {
  return useQuery({
    queryKey: ["roles", rolId, "permisos"],
    queryFn: () => obtenerRolConPermisosRequest(rolId as string),
    enabled: Boolean(rolId),
  });
}

export function usePermisosDisponibles() {
  return useQuery({
    queryKey: ["permisos"],
    queryFn: listarPermisosDisponiblesRequest,
  });
}

export function useActualizarRol(rolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EditarRolFormValues) => actualizarRolRequest(rolId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useAsignarPermiso(rolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permisoId: string) => asignarPermisoRequest(rolId, permisoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", rolId, "permisos"] });
    },
  });
}

export function useQuitarPermiso(rolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permisoId: string) => quitarPermisoRequest(rolId, permisoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles", rolId, "permisos"] });
    },
  });
}
