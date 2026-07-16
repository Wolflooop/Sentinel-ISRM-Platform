import { AccionAuditoria } from "@prisma/client";

/**
 * Hallazgo de auditoría (§3.10 / recomendación ALTA): Auditoria era una
 * tabla enteramente de solo escritura — ningún módulo exponía un endpoint
 * para leerla. Este módulo es exclusivamente de lectura: no crea, edita ni
 * elimina registros de Auditoria (eso lo sigue haciendo, sin cambios, cada
 * repository de negocio vía registrarAuditoria*() — ver Constitución:
 * "Repository — único lugar autorizado para Prisma Client").
 */
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
