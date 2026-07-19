export interface RolResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
  // Nivel jerárquico real del rol (ver enum TipoRol en el schema). El
  // frontend lo usa para, por ejemplo, no ofrecer roles ADMIN_TIC/SUPER_ADMIN
  // en el selector de un ADMIN_TIC creando un usuario común.
  tipo: string;
}

export interface RolConPermisosResponseDTO extends RolResponseDTO {
  permisos: Array<{ id: string; recurso: string; accion: string }>;
}
