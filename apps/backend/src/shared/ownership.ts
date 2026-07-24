import { TipoRol } from "@prisma/client";

/**
 * Fase 3B — Gestión de registros basada en responsable actual.
 *
 * Esta capa se aplica DESPUÉS del middleware `authorize` (permiso RBAC por
 * recurso/acción). `authorize` responde "¿este rol tiene el permiso?"; esta
 * función responde "¿este usuario en particular puede gestionar ESTE
 * registro?". Nunca sustituye a `authorize`; se usa junto a él, dentro de la
 * capa de servicio, en los puntos donde realmente se mutan datos.
 *
 * Regla de negocio (tal cual la definida por el propietario del producto):
 *   SI usuario.tipoRol === ADMIN_TIC          -> permitir gestión.
 *   SI usuario.id === registro.responsableId  -> permitir gestión.
 *   EN OTRO CASO                              -> denegar.
 *
 * Nota: SUPER_ADMIN no está contemplado en ninguna de las dos condiciones a
 * propósito. SUPER_ADMIN no participa en la gestión operativa de riesgos; si
 * en el futuro un usuario SUPER_ADMIN invoca una de estas acciones, esta
 * función deniega salvo que coincidiera con el responsableId (lo cual no
 * puede ocurrir: un SUPER_ADMIN es global y no pertenece a una organización).
 */
export interface UsuarioParaOwnership {
  usuarioId: string;
  tipoRol: TipoRol;
}

export interface RegistroConResponsable {
  responsableId: string | null | undefined;
}

export function canManageRegistro(
  usuario: UsuarioParaOwnership,
  registro: RegistroConResponsable
): boolean {
  if (usuario.tipoRol === "ADMIN_TIC") {
    return true;
  }
  return usuario.usuarioId === registro.responsableId;
}

/**
 * Reasignación de responsable (Riesgo.responsableId, Tratamiento.usuarioResponsableId):
 * regla más estricta que `canManageRegistro`. Un usuario común que sea el
 * responsable actual puede GESTIONAR el registro, pero nunca puede
 * REASIGNARLO a otra persona — solo Administrador TIC reasigna.
 */
export function canReasignarRegistro(usuario: UsuarioParaOwnership): boolean {
  return usuario.tipoRol === "ADMIN_TIC";
}
