export interface UsuarioConRol {
  id: string;
  organizacionId: string;
  rolId: string;
  nombre: string;
  email: string;
  activo: boolean;
  ultimoLogin: Date | null;
  creadoEn: Date;
  rol: {
    id: string;
    nombre: string;
  };
}

export interface CrearUsuarioParams {
  organizacionId: string;
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
