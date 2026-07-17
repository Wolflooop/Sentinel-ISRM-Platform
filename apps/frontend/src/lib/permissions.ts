export interface PermisoBasico {
  recurso: string;
  accion: string;
}


export function tienePermiso(
  permisos: PermisoBasico[] | undefined,
  recurso: string,
  accion: string
): boolean {
  if (!permisos) {
    return false;
  }
  return permisos.some((permiso) => permiso.recurso === recurso && permiso.accion === accion);
}
