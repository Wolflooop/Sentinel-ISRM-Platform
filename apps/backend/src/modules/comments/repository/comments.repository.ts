import { prisma } from "../../../config/prisma";
import { CrearComentarioParams, ComentarioConRelaciones, FiltrosComentarios } from "../types/comments.types";
import { registrarAuditoria } from "../../../shared/audit";

const INCLUDE_USUARIO = {
  usuario: { select: { id: true, nombre: true, email: true } },
} as const;

export async function findComentarios(
  filtros: FiltrosComentarios
): Promise<ComentarioConRelaciones[]> {
  return prisma.comentario.findMany({
    where: {
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.evaluacionId ? { evaluacionId: filtros.evaluacionId } : {}),
      ...(filtros.tratamientoId ? { tratamientoId: filtros.tratamientoId } : {}),
      ...(filtros.controlId ? { controlId: filtros.controlId } : {}),
    },
    include: INCLUDE_USUARIO,
    orderBy: { creadoEn: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Verificación de pertenencia a la organización del actor, según el destino.
// No existe una FK "organizacionId" directa en Comentario: la pertenencia se
// resuelve navegando hacia la entidad de destino, igual que en risks/
// evaluations/treatments.
// ---------------------------------------------------------------------------

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

export async function existeEvaluacionDeOrganizacion(
  evaluacionId: string,
  organizacionId: string
): Promise<boolean> {
  const e = await prisma.evaluacion.findFirst({
    where: {
      id: evaluacionId,
      riesgo: { OR: [{ aav: { activo: { organizacionId } } }, { creador: { organizacionId } }] },
    },
    select: { id: true },
  });
  return Boolean(e);
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

export async function crearComentario(params: CrearComentarioParams): Promise<ComentarioConRelaciones> {
  return prisma.$transaction(async (tx) => {
    const comentario = await tx.comentario.create({
      data: {
        riesgoId: params.riesgoId,
        evaluacionId: params.evaluacionId,
        tratamientoId: params.tratamientoId,
        controlId: params.controlId,
        usuarioId: params.usuarioId,
        contenido: params.contenido,
      },
      include: INCLUDE_USUARIO,
    });

    await registrarAuditoria(tx, {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Comentario",
      entidadId: comentario.id,
      accion: "CREAR",
      datosNuevos: {
        riesgoId: params.riesgoId,
        evaluacionId: params.evaluacionId,
        tratamientoId: params.tratamientoId,
        controlId: params.controlId,
      },
      direccionIp: params.direccionIp,
    });

    return comentario;
  });
}
