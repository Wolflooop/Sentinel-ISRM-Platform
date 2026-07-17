import { prisma } from "../../../config/prisma";
import {
  EventoSeguridadConUsuario,
  FiltrosEventosSeguridad,
  RegistrarEventoSeguridadParams,
} from "../types/security-events.types";


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
