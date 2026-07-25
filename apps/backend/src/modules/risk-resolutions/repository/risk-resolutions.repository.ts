import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { CrearResolucionParams, ResolucionRiesgoConRelaciones, FiltrosResoluciones } from "../types/risk-resolutions.types";
import { transicionarEstadoRiesgo } from "../../history/service/history.service";
import { registrarAuditoria } from "../../../shared/audit";

const INCLUDE_USUARIO = {
  usuario: { select: { id: true, nombre: true } },
} as const;

function whereOrganizacion(organizacionId: string) {
  return {
    riesgo: {
      OR: [
        { aav: { activo: { organizacionId } } },
        { creador: { organizacionId } },
      ],
    },
  };
}

export async function findResolucionesDeOrganizacion(
  organizacionId: string,
  filtros: FiltrosResoluciones
): Promise<ResolucionRiesgoConRelaciones[]> {
  return prisma.resolucionRiesgo.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    },
    include: INCLUDE_USUARIO,
    orderBy: { fecha: "desc" },
  });
}

export async function findRiesgoParaResolucion(
  riesgoId: string,
  organizacionId: string
): Promise<{ id: string; estado: string; responsableId: string | null } | null> {
  return prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      OR: [
        { aav: { activo: { organizacionId } } },
        { creador: { organizacionId } },
      ],
    },
    select: { id: true, estado: true, responsableId: true },
  });
}

/**
 * Crea la fila de ResolucionRiesgo (historial 1:N — nunca 1:1, ver punto 9
 * del prompt) y sincroniza Riesgo.estado en la MISMA transacción, a través
 * del único punto responsable de esa transición
 * (transicionarEstadoRiesgo, modules/history/service/history.service.ts).
 */
export async function crearResolucion(
  params: CrearResolucionParams
): Promise<ResolucionRiesgoConRelaciones> {
  const nuevoEstadoRiesgo = params.tipo === "RESOLUCION" ? "CERRADO" : "REABIERTO";

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await transicionarEstadoRiesgo(tx, {
      riesgoId: params.riesgoId,
      usuarioId: params.usuarioId,
      estadoNuevo: nuevoEstadoRiesgo,
      comentario: params.justificacion,
    });

    const resolucion = await tx.resolucionRiesgo.create({
      data: {
        riesgoId: params.riesgoId,
        tipo: params.tipo,
        justificacion: params.justificacion,
        usuarioId: params.usuarioId,
      },
      include: INCLUDE_USUARIO,
    });

    await registrarAuditoria(tx, {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "ResolucionRiesgo",
      entidadId: resolucion.id,
      accion: "CREAR",
      datosNuevos: { riesgoId: params.riesgoId, tipo: params.tipo },
      direccionIp: params.direccionIp,
    });

    return resolucion;
  });
}
