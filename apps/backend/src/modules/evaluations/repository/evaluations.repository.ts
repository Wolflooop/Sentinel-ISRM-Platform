import { prisma } from "../../../config/prisma";
import { CrearEvaluacionParams, EvaluacionConRelaciones, FiltrosEvaluaciones } from "../types/evaluations.types";

const EVALUACION_INCLUDE = {
  riesgo: {
    select: {
      id: true,
      valorRiesgo: true,
      nivelRiesgoInherente: true,
      estado: true,
    },
  },
  contexto: {
    select: {
      id: true,
      alcance: true,
      activo: true,
    },
  },
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
} as const;

function whereOrganizacion(organizacionId: string) {
  return {
    riesgo: {
      aav: {
        activo: {
          organizacionId,
        },
      },
    },
  };
}

export async function findEvaluaciones(
  organizacionId: string,
  filtros: FiltrosEvaluaciones
): Promise<EvaluacionConRelaciones[]> {
  return prisma.evaluacion.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
    },
    include: EVALUACION_INCLUDE,
    orderBy: { fechaEvaluacion: "desc" },
  });
}

export async function findEvaluacionPorId(
  id: string,
  organizacionId: string
): Promise<EvaluacionConRelaciones | null> {
  return prisma.evaluacion.findFirst({
    where: { id, ...whereOrganizacion(organizacionId) },
    include: EVALUACION_INCLUDE,
  });
}

export async function findRiesgoPorIdYOrganizacion(
  riesgoId: string,
  organizacionId: string
): Promise<{ id: string; aavId: string } | null> {
  return prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      aav: {
        activo: { organizacionId },
      },
    },
    select: { id: true, aavId: true },
  });
}

export async function findContextoActivoPorOrganizacion(
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.contexto.findFirst({
    where: { organizacionId, activo: true },
    select: { id: true },
  });
}

export async function crearEvaluacion(params: CrearEvaluacionParams): Promise<EvaluacionConRelaciones> {
  return prisma.evaluacion.create({
    data: {
      riesgoId: params.riesgoId,
      contextoId: params.contextoId,
      resultado: params.resultado,
      justificacion: params.justificacion,
      usuarioId: params.usuarioId,
    },
    include: EVALUACION_INCLUDE,
  });
}

export async function registrarAuditoriaEvaluacion(params: {
  usuarioId: string;
  organizacionId: string;
  entidadId: string;
  direccionIp: string;
}): Promise<void> {
  await prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Evaluacion",
      entidadId: params.entidadId,
      accion: "CREAR",
      datosNuevos: {
        riesgoId: params.entidadId,
      } as never,
      direccionIp: params.direccionIp,
    },
  });
}
