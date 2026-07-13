import { Permiso } from "../types/permissions.types";
import { PermisoResponseDTO } from "../dto/permissions.dto";

export function toPermisoResponseDTO(permiso: Permiso): PermisoResponseDTO {
  return {
    id: permiso.id,
    recurso: permiso.recurso,
    accion: permiso.accion,
    descripcion: permiso.descripcion,
  };
}

export function toPermisoResponseListDTO(permisos: Permiso[]): PermisoResponseDTO[] {
  return permisos.map(toPermisoResponseDTO);
}
