// Tipos alineados exactamente con RegistroAuditoriaResponseDTO
// (apps/backend/src/modules/audit/dto/audit.dto.ts) y con
// filtrosAuditoriaSchema (apps/backend/src/modules/audit/schema/audit.schema.ts).
// No se agregan campos que el backend no devuelva.

export type AccionAuditoria = "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";

export interface AuditUsuario {
  id: string;
  nombre: string;
  email: string;
}

export interface AuditRecord {
  id: string;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  datosAnteriores: unknown;
  datosNuevos: unknown;
  direccionIp: string;
  fecha: string;
  usuario: AuditUsuario;
}

export interface FiltrosAuditoria {
  entidad?: string;
  entidadId?: string;
  accion?: AccionAuditoria;
  usuarioId?: string;
  desde?: string;
  hasta?: string;
}
