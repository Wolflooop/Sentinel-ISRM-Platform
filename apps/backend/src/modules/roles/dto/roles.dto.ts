export interface RolResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
}

export interface RolConPermisosResponseDTO extends RolResponseDTO {
  permisos: Array<{ id: string; recurso: string; accion: string }>;
}
