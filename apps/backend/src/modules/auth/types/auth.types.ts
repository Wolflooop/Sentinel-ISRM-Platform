

import { TipoRol } from "@prisma/client";

export interface UsuarioConRol {
  id: string;
  // null para el Administrador Principal (SUPER_ADMIN).
  organizacionId: string | null;
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
    tipo: TipoRol;
  };
  organizacion: {
    id: string;
    nombre: string;
    estado: "ACTIVA" | "SUSPENDIDA" | "INACTIVA";
  } | null;
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
    tipo: TipoRol;
  };
  organizacion: {
    id: string;
    nombre: string;
  } | null;
}

export interface PerfilActualResult {
  usuario: UsuarioPerfil;
  permisos: Array<{ recurso: string; accion: string }>;
}
