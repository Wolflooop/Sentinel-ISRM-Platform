// Nota (Prioridad 6): el módulo de administración de roles (páginas,
// edición de permisos) se eliminó por no tener rutas ni menú — ver
// Objetivo 1. Este archivo sobrevive porque `TipoRol`/`Rol` son tipos
// compartidos que sí se usan al crear/editar usuarios (selector de rol).
export type TipoRol = "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
  tipo: TipoRol;
}
