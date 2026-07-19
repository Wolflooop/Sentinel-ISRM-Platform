import { TipoRol } from "@prisma/client";

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
  tipo: TipoRol;
}

export interface RolConPermisos extends Rol {
  permisos: Array<{ id: string; recurso: string; accion: string; descripcion: string | null }>;
}

export interface CrearRolParams {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarRolParams {
  nombre?: string;
  descripcion?: string;
}
