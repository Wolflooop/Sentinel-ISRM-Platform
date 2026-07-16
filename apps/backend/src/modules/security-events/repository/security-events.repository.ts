import { prisma } from "../../../config/prisma";
import {
  EventoSeguridadConUsuario,
  FiltrosEventosSeguridad,
  RegistrarEventoSeguridadParams,
} from "../types/security-events.types";

/**
 * Único lugar autorizado para Prisma Client dentro del módulo security-events
 * (mismo patrón que el resto de módulos — Constitución: "Repository — único
 * lugar autorizado para Prisma Client").
 *
 * Tabla de solo inserción, igual que Auditoria: no se exponen operaciones de
 * update/delete para EventoSeguridad.
 */
export async function crearEventoSeguridad(
  params: RegistrarEventoSeguridadParams
): Promise<void> {
  await prisma.eventoSeguridad.create({
    data: {
      evento: params.evento,
      resultado: params.resultado,
      severidad: params.severidad,
      direccionIp: params.direccionIp,
      descripcion: params.descripcion,
      usuarioId: params.usuarioId ?? null,
      organizacionId: params.organizacionId ?? null,
      detalles: (params.detalles ?? undefined) as never,
    },
  });
}

/**
 * Lectura (Hallazgo de auditoría §3.10, ALTA): antes de esto, EventoSeguridad
 * era enteramente de solo escritura, sin ningún endpoint de consulta. Solo se
 * exponen eventos con organizacionId = la del solicitante — los eventos con
 * organizacionId NULL (p. ej. un intento de login con una organización que
 * no existe) no tienen una organización a la que atribuirse, y este proyecto
 * no tiene un concepto de "super-admin" cross-tenant, así que quedan sin
 * exponer por ningún rol antes que inventar ese alcance nuevo.
 */
const LIMITE_REGISTROS = 200;

export async function findEventosSeguridad(
  organizacionId: string,
  filtros: FiltrosEventosSeguridad
): Promise<EventoSeguridadConUsuario[]> {
  return prisma.eventoSeguridad.findMany({
    where: {
      organizacionId,
      ...(filtros.evento ? { evento: filtros.evento } : {}),
      ...(filtros.resultado ? { resultado: filtros.resultado } : {}),
      ...(filtros.severidad ? { severidad: filtros.severidad } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha: {
              ...(filtros.desde ? { gte: filtros.desde } : {}),
              ...(filtros.hasta ? { lte: filtros.hasta } : {}),
            },
          }
        : {}),
    },
    include: {
      usuario: { select: { id: true, nombre: true, email: true } },
    },
    orderBy: { fecha: "desc" },
    take: LIMITE_REGISTROS,
  });
}

export async function findEventoSeguridadPorId(
  id: string,
  organizacionId: string
): Promise<EventoSeguridadConUsuario | null> {
  return prisma.eventoSeguridad.findFirst({
    where: { id, organizacionId },
    include: {
      usuario: { select: { id: true, nombre: true, email: true } },
    },
  });
}
