import { prisma } from "../../../config/prisma";
import { CrearEvidenciaParams, EvidenciaConRelaciones, FiltrosEvidencias, ValidarEvidenciaParams } from "../types/evidence.types";
import { registrarAuditoria } from "../../../shared/audit";

const INCLUDE_RELACIONES = {
  subidoPor: { select: { id: true, nombre: true, email: true } },
  validadoPor: { select: { id: true, nombre: true, email: true } },
} as const;

export async function findEvidencias(filtros: FiltrosEvidencias): Promise<EvidenciaConRelaciones[]> {
  return prisma.evidencia.findMany({
    where: {
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.tratamientoId ? { tratamientoId: filtros.tratamientoId } : {}),
      ...(filtros.controlId ? { controlId: filtros.controlId } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
    },
    include: INCLUDE_RELACIONES,
    orderBy: { creadoEn: "desc" },
  });
}

export async function findEvidenciaPorId(id: string): Promise<EvidenciaConRelaciones | null> {
  return prisma.evidencia.findUnique({ where: { id }, include: INCLUDE_RELACIONES });
}

export async function existeRiesgoDeOrganizacion(riesgoId: string, organizacionId: string): Promise<boolean> {
  const r = await prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }],
    },
    select: { id: true },
  });
  return Boolean(r);
}

export async function existeTratamientoDeOrganizacion(
  tratamientoId: string,
  organizacionId: string
): Promise<boolean> {
  const t = await prisma.tratamiento.findFirst({
    where: {
      id: tratamientoId,
      riesgo: { OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }] },
    },
    select: { id: true },
  });
  return Boolean(t);
}

export async function existeControlVisible(controlId: string, organizacionId: string): Promise<boolean> {
  const c = await prisma.control.findFirst({
    where: { id: controlId, OR: [{ organizacionId: null }, { organizacionId }] },
    select: { id: true },
  });
  return Boolean(c);
}

// Fase 3B: resuelve el responsable actual del "registro padre" de una
// Evidencia (riesgo, tratamiento o control — destino exclusivo, ya validado
// por validarDestino) para aplicar canManageRegistro.
export async function findResponsableDelDestino(
  destino: { riesgoId?: string | null; tratamientoId?: string | null; controlId?: string | null },
  organizacionId: string
): Promise<string | null | undefined> {
  if (destino.riesgoId) {
    const r = await prisma.riesgo.findFirst({
      where: {
        id: destino.riesgoId,
        OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }],
      },
      select: { responsableId: true },
    });
    return r?.responsableId ?? undefined;
  }
  if (destino.tratamientoId) {
    const t = await prisma.tratamiento.findFirst({
      where: {
        id: destino.tratamientoId,
        riesgo: { OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }] },
      },
      select: { usuarioResponsableId: true },
    });
    return t?.usuarioResponsableId ?? undefined;
  }
  if (destino.controlId) {
    const c = await prisma.control.findFirst({
      where: { id: destino.controlId, OR: [{ organizacionId: null }, { organizacionId }] },
      select: { responsableId: true },
    });
    return c?.responsableId ?? undefined;
  }
  return undefined;
}

// Verifica pertenencia a la organización, sin importar cuál de los tres
// destinos posibles tenga la evidencia — usado antes de exponer/descargar.
export async function perteneceAOrganizacion(
  evidencia: EvidenciaConRelaciones,
  organizacionId: string
): Promise<boolean> {
  if (evidencia.riesgoId) return existeRiesgoDeOrganizacion(evidencia.riesgoId, organizacionId);
  if (evidencia.tratamientoId) return existeTratamientoDeOrganizacion(evidencia.tratamientoId, organizacionId);
  if (evidencia.controlId) return existeControlVisible(evidencia.controlId, organizacionId);
  return false;
}

export async function crearEvidencia(params: CrearEvidenciaParams): Promise<EvidenciaConRelaciones> {
  return prisma.$transaction(async (tx) => {
    const evidencia = await tx.evidencia.create({
      data: {
        riesgoId: params.riesgoId,
        tratamientoId: params.tratamientoId,
        controlId: params.controlId,
        nombreArchivo: params.nombreArchivo,
        rutaArchivo: params.rutaArchivo,
        estado: "SUBIDA",
        subidoPorId: params.subidoPorId,
      },
      include: INCLUDE_RELACIONES,
    });

    await registrarAuditoria(tx, {
      usuarioId: params.subidoPorId,
      organizacionId: params.organizacionId,
      entidad: "Evidencia",
      entidadId: evidencia.id,
      accion: "CREAR",
      datosNuevos: {
        riesgoId: params.riesgoId,
        tratamientoId: params.tratamientoId,
        controlId: params.controlId,
        nombreArchivo: params.nombreArchivo,
      },
      direccionIp: params.direccionIp,
    });

    return evidencia;
  });
}

export async function validarEvidencia(params: ValidarEvidenciaParams): Promise<EvidenciaConRelaciones> {
  return prisma.$transaction(async (tx) => {
    const evidencia = await tx.evidencia.update({
      where: { id: params.evidenciaId },
      data: {
        estado: params.estado,
        comentarioValidacion: params.comentarioValidacion,
        validadoPorId: params.validadoPorId,
      },
      include: INCLUDE_RELACIONES,
    });

    await registrarAuditoria(tx, {
      usuarioId: params.validadoPorId,
      organizacionId: params.organizacionId,
      entidad: "Evidencia",
      entidadId: evidencia.id,
      accion: "APROBAR",
      datosNuevos: { estado: params.estado, comentarioValidacion: params.comentarioValidacion },
      direccionIp: params.direccionIp,
    });

    return evidencia;
  });
}
