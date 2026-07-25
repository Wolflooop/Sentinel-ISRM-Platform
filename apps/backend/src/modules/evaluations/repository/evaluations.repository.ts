import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { CrearEvaluacionParams, EvaluacionConRelaciones, FiltrosEvaluaciones, CeldaMatrizResumen } from "../types/evaluations.types";
import { transicionarEstadoRiesgo } from "../../history/service/history.service";
import { registrarAuditoria } from "../../../shared/audit";

const EVALUACION_INCLUDE = {
  riesgo: {
    select: {
      id: true,
      estado: true,
      origen: true,
      titulo: true,
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

// V2: Riesgo ya no cuelga siempre de un AAV (origen MANUAL) — el
// aislamiento se resuelve por CUALQUIERA de las dos cadenas posibles.
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

export async function findEvaluaciones(
  organizacionId: string,
  filtros: FiltrosEvaluaciones
): Promise<EvaluacionConRelaciones[]> {
  return prisma.evaluacion.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.tipoEvaluacion ? { tipoEvaluacion: filtros.tipoEvaluacion } : {}),
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
): Promise<{ id: string; responsableId: string | null } | null> {
  return prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      OR: [
        { aav: { activo: { organizacionId } } },
        { creador: { organizacionId } },
      ],
    },
    select: { id: true, responsableId: true },
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

export async function findCeldaMatriz(
  contextoId: string,
  nivelProbabilidad: number,
  nivelImpacto: number
): Promise<CeldaMatrizResumen | null> {
  return prisma.matrizRiesgo.findUnique({
    where: {
      contextoId_nivelProbabilidad_nivelImpacto: { contextoId, nivelProbabilidad, nivelImpacto },
    },
    select: { nivelResultante: true },
  });
}

export async function crearEvaluacion(params: CrearEvaluacionParams): Promise<EvaluacionConRelaciones> {
  const nuevoEstadoRiesgo = params.resultado === "ACEPTABLE" ? "ACEPTADO" : "EVALUADO";

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Único punto responsable de transicionar Riesgo.estado y registrar su
    // historial (ver modules/history/service/history.service.ts). Usa el
    // campo `comentario` independiente — nunca `justificacion`.
    await transicionarEstadoRiesgo(tx, {
      riesgoId: params.riesgoId,
      usuarioId: params.usuarioId,
      estadoNuevo: nuevoEstadoRiesgo,
      comentario: params.comentario,
    });

    const evaluacion = await tx.evaluacion.create({
      data: {
        riesgoId: params.riesgoId,
        contextoId: params.contextoId,
        tipoEvaluacion: params.tipoEvaluacion,
        probabilidad: params.probabilidad,
        impacto: params.impacto,
        valorCalculado: params.valorCalculado,
        nivelRiesgo: params.nivelRiesgo,
        resultado: params.resultado,
        justificacion: params.justificacion,
        usuarioId: params.usuarioId,
      },
    });

    // Riesgo.evaluacionActualId siempre apunta a la evaluación más
    // reciente (punto 3 del prompt: "Cada Riesgo mantiene únicamente un
    // puntero: evaluacionActualId").
    await tx.riesgo.update({
      where: { id: params.riesgoId },
      data: { evaluacionActualId: evaluacion.id },
    });

    await registrarAuditoria(tx, {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Evaluacion",
      entidadId: evaluacion.id,
      accion: "CREAR",
      datosNuevos: { riesgoId: params.riesgoId },
      direccionIp: params.direccionIp,
    });

    return tx.evaluacion.findUniqueOrThrow({
      where: { id: evaluacion.id },
      include: EVALUACION_INCLUDE,
    });
  });
}

