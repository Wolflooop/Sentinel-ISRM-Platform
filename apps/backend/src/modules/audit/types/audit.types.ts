import { AccionAuditoria } from "@prisma/client";


export interface RegistroAuditoria {
  id: string;
  entidad: string;
  entidadId: string;
  accion: AccionAuditoria;
  datosAnteriores: unknown;
  datosNuevos: unknown;
  direccionIp: string;
  fecha: Date;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface FiltrosAuditoria {
  entidad?: string;
  entidadId?: string;
  accion?: AccionAuditoria;
  usuarioId?: string;
  desde?: Date;
  hasta?: Date;
}

export type { AccionAuditoria };
