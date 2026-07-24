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

/**
 * Espejo en frontend de `shared/ownership.ts` (backend): decide si el
 * usuario actual puede GESTIONAR (mutar) un registro que expone
 * `responsableId`. Se usa exclusivamente para decidir qué mostrar en la
 * UI — el backend sigue siendo quien realmente autoriza cada mutación.
 *
 *   Administrador TIC -> siempre puede gestionar.
 *   Usuario Operativo -> solo si es el responsable actual del registro.
 */
export interface UsuarioParaOwnership {
  id: string;
  tipoRol: "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";
}

export function puedeGestionarRegistro(
  usuario: UsuarioParaOwnership | undefined,
  responsableId: string | null | undefined
): boolean {
  if (!usuario) {
    return false;
  }
  if (usuario.tipoRol === "ADMIN_TIC") {
    return true;
  }
  return usuario.id === responsableId;
}

/** Reasignar responsable es exclusivo de Administrador TIC, incluso si el
 * usuario común es el responsable actual del registro. */
export function puedeReasignarRegistro(usuario: UsuarioParaOwnership | undefined): boolean {
  return usuario?.tipoRol === "ADMIN_TIC";
}
