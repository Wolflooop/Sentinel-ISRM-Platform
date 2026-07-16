import { prisma } from "../../../config/prisma";
import { FiltrosAuditoria, RegistroAuditoria } from "../types/audit.types";

/**
 * Límite de resultados por consulta: Auditoria no tiene paginación en
 * ningún módulo del proyecto (brecha MEDIA ya conocida, §3.16/§3.17), pero
 * al ser este un módulo nuevo, escrito desde cero, se aplica un `take` fijo
 * como salvaguarda mínima contra una consulta sin límite sobre una tabla de
 * solo inserción que crece indefinidamente — no es una funcionalidad de
 * paginación (no hay cursor/página), solo evita una respuesta ilimitada.
 */
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
