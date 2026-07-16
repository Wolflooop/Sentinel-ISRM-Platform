import {
  TipoEventoSeguridad,
  ResultadoEventoSeguridad,
  SeveridadEventoSeguridad,
} from "@prisma/client";

/**
 * Tipos internos del módulo security-events, compartidos entre service y
 * repository, más los tipos de la capa de lectura (controller/mapper/dto)
 * agregada por el Hallazgo de auditoría §3.10.
 */

export interface RegistrarEventoSeguridadParams {
  evento: TipoEventoSeguridad;
  resultado: ResultadoEventoSeguridad;
  severidad: SeveridadEventoSeguridad;
  direccionIp: string;
  descripcion: string;
  // Nullable a propósito: un intento de login con organización/usuario
  // inexistentes no tiene una identidad resuelta que referenciar.
  usuarioId?: string | null;
  organizacionId?: string | null;
  // Contexto técnico adicional (ver comentario de `detalles` en schema.prisma).
  detalles?: Record<string, unknown> | null;
}

export type {
  TipoEventoSeguridad,
  ResultadoEventoSeguridad,
  SeveridadEventoSeguridad,
};

/**
 * Capa de lectura (Hallazgo de auditoría §3.10, ALTA). El comentario
 * original de este archivo ("no hay DTO de respuesta ni controller en esta
 * fase: este módulo solo escribe") queda desactualizado por decisión
 * explícita: sí se expone lectura ahora.
 */
export interface EventoSeguridadConUsuario {
  id: string;
  evento: TipoEventoSeguridad;
  resultado: ResultadoEventoSeguridad;
  severidad: SeveridadEventoSeguridad;
  direccionIp: string;
  descripcion: string;
  detalles: unknown;
  fecha: Date;
  usuario: { id: string; nombre: string; email: string } | null;
}

export interface FiltrosEventosSeguridad {
  evento?: TipoEventoSeguridad;
  resultado?: ResultadoEventoSeguridad;
  severidad?: SeveridadEventoSeguridad;
  desde?: Date;
  hasta?: Date;
}
