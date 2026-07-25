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

// Actor autenticado que ejecuta la acción, para auditoría.
// organizacionId puede ser null: caso SUPER_ADMIN (usuario global). Ese
// null se resuelve a la organización técnica "__SISTEMA__" en
// shared/audit.ts antes de escribir en Auditoria (que no admite null).
export interface ActorRoles {
  usuarioId: string;
  organizacionId: string | null;
  direccionIp: string;
}
