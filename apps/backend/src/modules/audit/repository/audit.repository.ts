import { prisma } from "../../../config/prisma";
import { FiltrosAuditoria, RegistroAuditoria } from "../types/audit.types";


const LIMITE_REGISTROS = 200;

const REGISTRO_INCLUDE = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
} as const;

export async function findRegistrosAuditoria(
  organizacionId: string,
  filtros: FiltrosAuditoria
): Promise<RegistroAuditoria[]> {
  return prisma.auditoria.findMany({
    where: {
      organizacionId,
      ...(filtros.entidad ? { entidad: filtros.entidad } : {}),
      ...(filtros.entidadId ? { entidadId: filtros.entidadId } : {}),
      ...(filtros.accion ? { accion: filtros.accion } : {}),
      ...(filtros.usuarioId ? { usuarioId: filtros.usuarioId } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fecha: {
              ...(filtros.desde ? { gte: filtros.desde } : {}),
              ...(filtros.hasta ? { lte: filtros.hasta } : {}),
            },
          }
        : {}),
    },
    include: REGISTRO_INCLUDE,
    orderBy: { fecha: "desc" },
    take: LIMITE_REGISTROS,
  });
}

export async function findRegistroAuditoriaPorId(
  id: string,
  organizacionId: string
): Promise<RegistroAuditoria | null> {
  return prisma.auditoria.findFirst({
    where: { id, organizacionId },
    include: REGISTRO_INCLUDE,
  });
}
