import { TipoRol } from "@prisma/client";

export interface UsuarioConRol {
  id: string;
  organizacionId: string | null;
  rolId: string;
  nombre: string;
  email: string;
  activo: boolean;
  ultimoLogin: Date | null;
  creadoEn: Date;
  rol: {
    id: string;
    nombre: string;
    tipo: TipoRol;
  };
}

export interface CrearUsuarioParams {
  organizacionId: string | null;
  rolId: string;
  nombre: string;
  email: string;
  passwordHash: string;
}

export interface ActualizarUsuarioParams {
  nombre?: string;
  email?: string;
  rolId?: string;
}
