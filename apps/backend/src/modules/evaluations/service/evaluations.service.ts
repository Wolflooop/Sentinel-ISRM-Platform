import { AppError } from "../../../shared/AppError";
import { canManageRegistro, UsuarioParaOwnership } from "../../../shared/ownership";
import {
  findEvaluaciones,
  findEvaluacionPorId,
  findRiesgoPorIdYOrganizacion,
  findContextoActivoPorOrganizacion,
  findCeldaMatriz,
  crearEvaluacion,
  registrarAuditoriaEvaluacion,
} from "../repository/evaluations.repository";
import { CrearEvaluacionInput } from "../schema/evaluations.schema";
import { EvaluacionConRelaciones, FiltrosEvaluaciones } from "../types/evaluations.types";

interface ActorAuditoria extends UsuarioParaOwnership {
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

  // Fase 3B: evaluar un riesgo es una acción de gestión sobre ese riesgo.
  // Administrador TIC gestiona cualquiera de su organización; un usuario
  // común solo puede evaluar el riesgo del que es responsable actual.
  if (!canManageRegistro(actor, riesgo)) {
    throw new AppError(
      "Acceso denegado: solo el responsable actual del riesgo o un Administrador TIC pueden registrar una evaluación",
      403
    );
  }

  const contexto = await findContextoActivoPorOrganizacion(organizacionId);
  if (!contexto) {
    throw new AppError("La organización no tiene un Contexto ISO activo", 409);
  }

  if (contexto.id !== input.contextoId) {
    throw new AppError("El contexto indicado no es el contexto activo de la organización", 409);
  }

  const celda = await findCeldaMatriz(contexto.id, input.probabilidad, input.impacto);
  if (!celda) {
    throw new AppError(
      "El contexto activo no tiene definida esa combinación de probabilidad/impacto en su matriz de riesgo",
      409
    );
  }

  const valorCalculado = input.probabilidad * input.impacto;

  const evaluacion = await crearEvaluacion({
    riesgoId: input.riesgoId,
    contextoId: input.contextoId,
    tipoEvaluacion: input.tipoEvaluacion,
    probabilidad: input.probabilidad,
    impacto: input.impacto,
    valorCalculado,
    nivelRiesgo: celda.nivelResultante,
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
