export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
}

export interface Permiso {
  id: string;
  recurso: string;
  accion: string;
}

export interface RolConPermisos extends Rol {
  permisos: Permiso[];
}
