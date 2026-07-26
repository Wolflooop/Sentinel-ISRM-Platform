import { AppError } from "../../../shared/AppError";
import { canManageRegistro, canReasignarRegistro, UsuarioParaOwnership } from "../../../shared/ownership";
import {
  actualizarTratamiento,
  crearTratamiento,
  findControlesVisiblesPorIds,
  findEvaluacionOrigenPorIdYOrganizacion,
  findRiesgoParaTratamiento,
  findTratamientoPorId,
  findTratamientos,
  findUsuarioResponsablePorOrganizacion,
} from "../repository/treatments.repository";
import { CrearTratamientoInput, ActualizarTratamientoInput } from "../schema/treatments.schema";
import { FiltrosTratamientos, TratamientoConRelaciones } from "../types/treatments.types";

interface ActorAuditoria extends UsuarioParaOwnership {
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

async function validarControles(
  controlIds: string[],
  organizacionId: string
): Promise<Map<string, string>> {
  if (controlIds.length === 0) {
    return new Map();
  }
  const controles = await findControlesVisiblesPorIds(controlIds, organizacionId);
  if (controles.length !== new Set(controlIds).size) {
    throw new AppError(
      "Uno o más de los controles indicados no son válidos para esta organización",
      404
    );
  }
  return new Map(controles.map((c) => [c.id, c.tipo]));
}

export async function crearNuevoTratamiento(
  organizacionId: string,
  input: CrearTratamientoInput,
  actor: ActorAuditoria
): Promise<TratamientoConRelaciones> {
  const riesgo = await findRiesgoParaTratamiento(input.riesgoId, organizacionId);
  if (!riesgo) {
    throw new AppError("El riesgo especificado no existe en esta organización", 404);
  }

  // Fase 3B: crear un tratamiento es gestionar el riesgo al que pertenece.
  if (!canManageRegistro(actor, riesgo)) {
    throw new AppError(
      "Acceso denegado: solo el responsable actual del riesgo o un Administrador TIC pueden crear un tratamiento",
      403
    );
  }

  if (input.evaluacionOrigenId) {
    const evaluacionOrigen = await findEvaluacionOrigenPorIdYOrganizacion(
      input.evaluacionOrigenId,
      organizacionId
    );
    if (!evaluacionOrigen || evaluacionOrigen.riesgoId !== input.riesgoId) {
      throw new AppError(
        "La evaluación de origen indicada no corresponde a este riesgo en esta organización",
        404
      );
    }
  }

  const tiposPorControl = await validarControles(input.controlIds, organizacionId);
  const controlPrincipalTipo = input.controlPrincipalId
    ? tiposPorControl.get(input.controlPrincipalId) ?? null
    : null;

  const usuarioResponsable = await findUsuarioResponsablePorOrganizacion(
    input.usuarioResponsableId,
    organizacionId
  );
  if (!usuarioResponsable) {
    throw new AppError("El usuario responsable indicado no pertenece a la organización", 404);
  }

  if (input.aprobadoPorId) {
    const aprobador = await findUsuarioResponsablePorOrganizacion(input.aprobadoPorId, organizacionId);
    if (!aprobador) {
      throw new AppError("El usuario aprobador indicado no pertenece a la organización", 404);
    }
  }

  const tratamiento = await crearTratamiento({
    riesgoId: input.riesgoId,
    evaluacionOrigenId: input.evaluacionOrigenId ?? null,
    controlIds: input.controlIds,
    controlPrincipalId: input.controlPrincipalId ?? null,
    estrategia: input.estrategia,
    descripcionPlan: input.descripcionPlan,
    usuarioResponsableId: input.usuarioResponsableId,
    fechaInicio: input.fechaInicio ?? null,
    justificacion: input.justificacion ?? null,
    aprobadoPorId: input.aprobadoPorId ?? null,
    fechaAprobacion: input.fechaAprobacion ?? null,
    fechaLimite: input.fechaLimite,
    estado: input.estado ?? "PROPUESTO",
    porcentajeAvance: input.porcentajeAvance ?? 0,
    riesgoEvaluacionActual: riesgo.evaluacionActual,
    controlPrincipalTipo,
    usuarioId: actor.usuarioId,
    organizacionId,
    comentario: input.comentario,
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

  // Fase 3B: gestionar (actualizar) un tratamiento requiere ser su
  // responsable actual (usuarioResponsableId) o Administrador TIC. Nótese
  // que el "registro" aquí es el propio tratamiento, no el riesgo padre:
  // un tratamiento tiene su responsable operativo propio.
  if (!canManageRegistro(actor, { responsableId: tratamiento.usuarioResponsableId })) {
    throw new AppError(
      "Acceso denegado: solo el responsable actual del tratamiento o un Administrador TIC pueden actualizarlo",
      403
    );
  }

  // Reasignar el responsable del tratamiento (cambiar usuarioResponsableId)
  // es una operación reservada a Administrador TIC, igual que la
  // reasignación de responsable de un riesgo: el responsable actual no
  // puede reasignarse a otra persona a sí mismo.
  if (
    input.usuarioResponsableId !== undefined &&
    input.usuarioResponsableId !== tratamiento.usuarioResponsableId &&
    !canReasignarRegistro(actor)
  ) {
    throw new AppError(
      "Acceso denegado: solo un Administrador TIC puede reasignar el responsable de un tratamiento",
      403
    );
  }

  const riesgo = await findRiesgoParaTratamiento(tratamiento.riesgoId, organizacionId);
  if (!riesgo) {
    throw new AppError("El riesgo asociado no existe en esta organización", 404);
  }

  let controlIdsFinal: string[] | undefined = input.controlIds;
  let tiposPorControl = new Map<string, string>();
  if (controlIdsFinal !== undefined) {
    tiposPorControl = await validarControles(controlIdsFinal, organizacionId);
  } else {
    tiposPorControl = new Map(tratamiento.controles.map((c) => [c.id, c.tipo]));
  }

  const controlIdsEfectivos = controlIdsFinal ?? tratamiento.controles.map((c) => c.id);

  let controlPrincipalIdFinal: string | null =
    input.controlPrincipalId !== undefined
      ? input.controlPrincipalId
      : tratamiento.controles.find((c) => c.esPrincipal)?.id ?? null;

  if (controlPrincipalIdFinal && !controlIdsEfectivos.includes(controlPrincipalIdFinal)) {
    throw new AppError("controlPrincipalId debe estar incluido en los controles del tratamiento", 422);
  }

  const controlPrincipalTipoFinal = controlPrincipalIdFinal
    ? tiposPorControl.get(controlPrincipalIdFinal) ?? null
    : null;

  if (input.usuarioResponsableId) {
    const usuarioResponsable = await findUsuarioResponsablePorOrganizacion(
      input.usuarioResponsableId,
      organizacionId
    );
    if (!usuarioResponsable) {
      throw new AppError("El usuario responsable indicado no pertenece a la organización", 404);
    }
  }

  if (input.aprobadoPorId) {
    const aprobador = await findUsuarioResponsablePorOrganizacion(input.aprobadoPorId, organizacionId);
    if (!aprobador) {
      throw new AppError("El usuario aprobador indicado no pertenece a la organización", 404);
    }
  }

  const estrategiaFinal = input.estrategia ?? tratamiento.estrategia;
  if (estrategiaFinal === "MITIGAR" && controlIdsEfectivos.length === 0) {
    throw new AppError("La estrategia MITIGAR requiere especificar un control asociado", 422);
  }

  const tratamientoActualizado = await actualizarTratamiento(
    id,
    {
      controlIds: controlIdsFinal,
      controlPrincipalId: input.controlPrincipalId,
      estrategia: input.estrategia,
      descripcionPlan: input.descripcionPlan,
      usuarioResponsableId: input.usuarioResponsableId,
      fechaInicio: input.fechaInicio,
      justificacion: input.justificacion,
      aprobadoPorId: input.aprobadoPorId,
      fechaAprobacion: input.fechaAprobacion,
      fechaLimite: input.fechaLimite,
      estado: input.estado,
      porcentajeAvance: input.porcentajeAvance,
    },
    {
      riesgoId: tratamiento.riesgoId,
      riesgoEvaluacionActual: riesgo.evaluacionActual,
      estrategiaFinal,
      controlPrincipalTipoFinal,
      controlPrincipalIdFinal,
      usuarioId: actor.usuarioId,
      organizacionId,
      direccionIp: actor.direccionIp,
      comentario: input.comentario,
    }
  );

  return tratamientoActualizado;
}
