export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
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
