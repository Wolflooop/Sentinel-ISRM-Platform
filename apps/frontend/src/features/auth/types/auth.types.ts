export type TipoRol = "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";

export interface LoginResponse {
  token: string;
  expiraEn: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tipoRol: TipoRol;
    // null para el Administrador Principal (SUPER_ADMIN): es un usuario
    // global que no pertenece a ninguna organización.
    organizacion: {
      id: string;
      nombre: string;
    } | null;
  };
}

export interface PermisoActual {
  recurso: string;
  accion: string;
}

export interface PerfilActual {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    tipoRol: TipoRol;
    organizacion: {
      id: string;
      nombre: string;
    } | null;
  };
  permisos: PermisoActual[];
}
