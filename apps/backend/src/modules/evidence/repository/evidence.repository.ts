import { prisma } from "../../../config/prisma";
import { CrearEvidenciaParams, EvidenciaConRelaciones, FiltrosEvidencias, ValidarEvidenciaParams } from "../types/evidence.types";

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

    await tx.auditoria.create({
      data: {
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
        } as never,
        direccionIp: params.direccionIp,
      },
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

    await tx.auditoria.create({
      data: {
        usuarioId: params.validadoPorId,
        organizacionId: params.organizacionId,
        entidad: "Evidencia",
        entidadId: evidencia.id,
        accion: "APROBAR",
        datosNuevos: { estado: params.estado, comentarioValidacion: params.comentarioValidacion } as never,
        direccionIp: params.direccionIp,
      },
    });

    return evidencia;
  });
}
