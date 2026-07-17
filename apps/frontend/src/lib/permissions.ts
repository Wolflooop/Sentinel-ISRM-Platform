export interface PermisoBasico {
  recurso: string;
  accion: string;
}

/**
 * Verifica si una lista de permisos (tal como los devuelve GET /auth/me,
 * ver features/auth/hooks/usePerfilActual.ts) contiene el par
 * (recurso, accion) solicitado.
 *
 * Punto único de esta comparación — usado por ConPermiso, RequierePermiso
 * y el filtrado del menú en AppShell, para no repetir el mismo `.some(...)`
 * en cada lugar.
 */
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
