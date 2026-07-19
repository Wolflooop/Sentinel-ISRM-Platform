import { AppError } from "../../../shared/AppError";
import {
  findEvaluaciones,
  findEvaluacionPorId,
  findRiesgoPorIdYOrganizacion,
  findContextoActivoPorOrganizacion,
  crearEvaluacion,
  registrarAuditoriaEvaluacion,
} from "../repository/evaluations.repository";
import { CrearEvaluacionInput } from "../schema/evaluations.schema";
import { EvaluacionConRelaciones, FiltrosEvaluaciones } from "../types/evaluations.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarEvaluaciones(
  organizacionId: string,
  filtros: FiltrosEvaluaciones
): Promise<EvaluacionConRelaciones[]> {
  return findEvaluaciones(organizacionId, filtros);
}

export async function obtenerEvaluacion(
  id: string,
  organizacionId: string
): Promise<EvaluacionConRelaciones> {
  const evaluacion = await findEvaluacionPorId(id, organizacionId);
  if (!evaluacion) {
    throw new AppError("Evaluación no encontrada", 404);
  }
  return evaluacion;
}

export async function crearNuevaEvaluacion(
  organizacionId: string,
  input: CrearEvaluacionInput,
  actor: ActorAuditoria
): Promise<EvaluacionConRelaciones> {
  const riesgo = await findRiesgoPorIdYOrganizacion(input.riesgoId, organizacionId);
  if (!riesgo) {
    throw new AppError("El riesgo especificado no existe en esta organización", 404);
  }

  const contexto = await findContextoActivoPorOrganizacion(organizacionId);
  if (!contexto) {
    throw new AppError("La organización no tiene un Contexto ISO activo", 409);
  }

  if (contexto.id !== input.contextoId) {
    throw new AppError("El contexto indicado no es el contexto activo de la organización", 409);
  }

  const evaluacion = await crearEvaluacion({
    riesgoId: input.riesgoId,
    contextoId: input.contextoId,
    resultado: input.resultado,
    justificacion: input.justificacion,
    comentario: input.comentario,
    usuarioId: actor.usuarioId,
    organizacionId,
    direccionIp: actor.direccionIp,
  });

  await registrarAuditoriaEvaluacion({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidadId: evaluacion.id,
    direccionIp: actor.direccionIp,
  });

  return evaluacion;
}
