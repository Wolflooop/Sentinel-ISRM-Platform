

export interface UsuarioConRol {
  id: string;
  organizacionId: string;
  rolId: string;
  nombre: string;
  email: string;
  passwordHash: string;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;
  activo: boolean;
  rol: {
    id: string;
    nombre: string;
  };
  organizacion: {
    id: string;
    nombre: string;
    estado: "ACTIVA" | "SUSPENDIDA" | "INACTIVA";
  };
}

export interface LoginResult {
  usuario: UsuarioConRol;
  token: string;
  expiraEn: Date;
}

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  email: string;
  rol: {
    id: string;
    nombre: string;
  };
  organizacion: {
    id: string;
    nombre: string;
  };
}

export interface PerfilActualResult {
  usuario: UsuarioPerfil;
  permisos: Array<{ recurso: string; accion: string }>;
}
