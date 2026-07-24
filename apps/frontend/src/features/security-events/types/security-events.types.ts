// Tipos alineados exactamente con EventoSeguridadResponseDTO
// (apps/backend/src/modules/security-events/dto/security-events.dto.ts) y con
// filtrosEventosSeguridadSchema
// (apps/backend/src/modules/security-events/schema/security-events.schema.ts).
// No se agregan campos que el backend no devuelva.

export type TipoEventoSeguridad =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_SESSION_EXPIRED"
  | "AUTH_ACCESS_DENIED";

export type ResultadoEventoSeguridad = "EXITO" | "FALLIDO";

export type SeveridadEventoSeguridad = "INFO" | "ADVERTENCIA" | "ALTA" | "CRITICA";

export interface SecurityEventUsuario {
  id: string;
  nombre: string;
  email: string;
}

export interface SecurityEvent {
  id: string;
  evento: TipoEventoSeguridad;
  resultado: ResultadoEventoSeguridad;
  severidad: SeveridadEventoSeguridad;
  direccionIp: string;
  descripcion: string;
  detalles: unknown;
  fecha: string;
  usuario: SecurityEventUsuario | null;
}

export interface FiltrosEventosSeguridad {
  evento?: TipoEventoSeguridad;
  resultado?: ResultadoEventoSeguridad;
  severidad?: SeveridadEventoSeguridad;
  desde?: string;
  hasta?: string;
}
