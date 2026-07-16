import { AppError } from "../../../shared/AppError";
import {
  actualizarTratamiento,
  crearTratamiento,
  findControlPrincipalPorIdYOrganizacion,
  findEvaluacionPorIdYOrganizacion,
  findTratamientoPorEvaluacionId,
  findTratamientoPorId,
  findTratamientos,
  findUsuarioResponsablePorOrganizacion,
  registrarAuditoriaTratamiento,
} from "../repository/treatments.repository";
import { CrearTratamientoInput, ActualizarTratamientoInput } from "../schema/treatments.schema";
import { FiltrosTratamientos, TratamientoConRelaciones } from "../types/treatments.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarTratamientos(
  organizacionId: string,
  filtros: FiltrosTratamientos
): Promise<TratamientoConRelaciones[]> {
  return findTratamientos(organizacionId, filtros);
}

export async function obtenerTratamiento(
  id: string,
  organizacionId: string
): Promise<TratamientoConRelaciones> {
  const tratamiento = await findTratamientoPorId(id, organizacionId);
  if (!tratamiento) {
    throw new AppError("Tratamiento no encontrado", 404);
  }
  return tratamiento;
}

export async function crearNuevoTratamiento(
  organizacionId: string,
  input: CrearTratamientoInput,
  actor: ActorAuditoria
): Promise<TratamientoConRelaciones> {
  const evaluacion = await findEvaluacionPorIdYOrganizacion(input.evaluacionId, organizacionId);
  if (!evaluacion) {
    throw new AppError("La evaluación especificada no existe en esta organización", 404);
  }

  const tratamientoExistente = await findTratamientoPorEvaluacionId(input.evaluacionId, organizacionId);
  if (tratamientoExistente) {
    throw new AppError("La evaluación ya tiene un tratamiento asociado", 409);
  }

  let controlPrincipalTipo: string | null = null;
  if (input.controlPrincipalId) {
    const control = await findControlPrincipalPorIdYOrganizacion(input.controlPrincipalId, organizacionId);
    if (!control) {
      throw new AppError("El control principal indicado no es válido para la organización", 404);
    }
    controlPrincipalTipo = control.tipo;
  }

  const usuarioResponsable = await findUsuarioResponsablePorOrganizacion(
    input.usuarioResponsableId,
    organizacionId
  );
  if (!usuarioResponsable) {
    throw new AppError("El usuario responsable indicado no pertenece a la organización", 404);
  }

  const tratamiento = await crearTratamiento({
    evaluacionId: input.evaluacionId,
    controlPrincipalId: input.controlPrincipalId ?? null,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan,
    usuarioResponsableId: input.usuarioResponsableId,
    fechaLimite: input.fechaLimite,
    estado: input.estado ?? "PLANIFICADO",
    porcentajeAvance: input.porcentajeAvance ?? 0,
    riesgoId: evaluacion.riesgo.id,
    controlPrincipalTipo,
  });

  await registrarAuditoriaTratamiento({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidadId: tratamiento.id,
    accion: "CREAR",
    direccionIp: actor.direccionIp,
  });

  return tratamiento;
}

export async function actualizarTratamientoExistente(
  id: string,
  organizacionId: string,
  input: ActualizarTratamientoInput,
  actor: ActorAuditoria
): Promise<TratamientoConRelaciones> {
  const tratamiento = await findTratamientoPorId(id, organizacionId);
  if (!tratamiento) {
    throw new AppError("Tratamiento no encontrado", 404);
  }

  let controlPrincipalTipoFinal: string | null = tratamiento.controlPrincipal?.tipo ?? null;
  if (input.controlPrincipalId !== undefined) {
    if (input.controlPrincipalId) {
      const control = await findControlPrincipalPorIdYOrganizacion(input.controlPrincipalId, organizacionId);
      if (!control) {
        throw new AppError("El control principal indicado no es válido para la organización", 404);
      }
      controlPrincipalTipoFinal = control.tipo;
    } else {
      controlPrincipalTipoFinal = null;
    }
  }

  if (input.usuarioResponsableId) {
    const usuarioResponsable = await findUsuarioResponsablePorOrganizacion(
      input.usuarioResponsableId,
      organizacionId
    );
    if (!usuarioResponsable) {
      throw new AppError("El usuario responsable indicado no pertenece a la organización", 404);
    }
  }

  const estrategiaFinal = input.estrategia ?? tratamiento.estrategia;
  if (estrategiaFinal === "MITIGAR" && !controlPrincipalTipoFinal) {
    throw new AppError("La estrategia MITIGAR requiere especificar un controlPrincipalId", 422);
  }

  const tratamientoActualizado = await actualizarTratamiento(
    id,
    {
      ...input,
      controlPrincipalId: input.controlPrincipalId,
      estrategia: input.estrategia,
      descripcionPlan: input.descripcionPlan,
      usuarioResponsableId: input.usuarioResponsableId,
      fechaLimite: input.fechaLimite,
      estado: input.estado,
      porcentajeAvance: input.porcentajeAvance,
    },
    {
      riesgoId: tratamiento.evaluacion.riesgo.id,
      evaluacionId: tratamiento.evaluacionId,
      estrategiaFinal,
      controlPrincipalTipoFinal,
    }
  );

  await registrarAuditoriaTratamiento({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidadId: tratamientoActualizado.id,
    accion: "EDITAR",
    direccionIp: actor.direccionIp,
  });

  return tratamientoActualizado;
}
