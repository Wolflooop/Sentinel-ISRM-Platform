import {
  TipoEventoSeguridad,
  ResultadoEventoSeguridad,
  SeveridadEventoSeguridad,
} from "@prisma/client";



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
