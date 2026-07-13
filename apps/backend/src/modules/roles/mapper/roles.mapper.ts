import { Rol, RolConPermisos } from "../types/roles.types";
import { RolResponseDTO, RolConPermisosResponseDTO } from "../dto/roles.dto";

export function toRolResponseDTO(rol: Rol): RolResponseDTO {
  return {
    id: rol.id,
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    esSistema: rol.esSistema,
  };
}

export function toRolResponseListDTO(roles: Rol[]): RolResponseDTO[] {
  return roles.map(toRolResponseDTO);
}

export function toRolConPermisosResponseDTO(rol: RolConPermisos): RolConPermisosResponseDTO {
  return {
    ...toRolResponseDTO(rol),
    permisos: rol.permisos.map((p) => ({ id: p.id, recurso: p.recurso, accion: p.accion })),
  };
}
