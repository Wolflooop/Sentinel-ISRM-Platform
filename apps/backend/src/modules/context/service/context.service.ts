import { AppError } from "../../../shared/AppError";
import {
  findContextosPorOrganizacion,
  findContextoPorIdYOrganizacion,
  findContextoActivoPorOrganizacion,
  crearContexto,
  actualizarContexto,
  contarEscalasImpacto,
  contarEscalasProbabilidad,
  contarMatriz,
  reemplazarEscalasImpacto,
  reemplazarEscalasProbabilidad,
  reemplazarMatriz,
  activarContextoTransaccion,
  registrarAuditoria,
} from "../repository/context.repository";
import { Contexto, ContextoConDetalle } from "../types/context.types";
import {
  CrearContextoInput,
  ActualizarContextoInput,
  ReemplazarEscalaInput,
  ReemplazarMatrizInput,
} from "../schema/context.schema";

const ENTIDAD = "Contexto";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarContextos(organizacionId: string): Promise<Contexto[]> {
  return findContextosPorOrganizacion(organizacionId);
}

export async function obtenerContexto(
  id: string,
  organizacionId: string
): Promise<ContextoConDetalle> {
  const contexto = await findContextoPorIdYOrganizacion(id, organizacionId);
  if (!contexto) {
    throw new AppError("Contexto no encontrado", 404);
  }
  return contexto;
}

export async function obtenerContextoActivo(
  organizacionId: string
): Promise<ContextoConDetalle | null> {
  return findContextoActivoPorOrganizacion(organizacionId);
}

export async function crearNuevoContexto(
  organizacionId: string,
  input: CrearContextoInput,
  actor: ActorAuditoria
): Promise<Contexto> {
  const contexto = await crearContexto({ organizacionId, ...input });

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: contexto.id,
    accion: "CREAR",
    datosNuevos: { alcance: contexto.alcance, criteriosAceptacion: contexto.criteriosAceptacion },
    direccionIp: actor.direccionIp,
  });

  return contexto;
}

export async function actualizarContextoExistente(
  id: string,
  organizacionId: string,
  input: ActualizarContextoInput,
  actor: ActorAuditoria
): Promise<Contexto> {
  const anterior = await obtenerContexto(id, organizacionId);

  const actualizado = await actualizarContexto(id, input);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosAnteriores: {
      alcance: anterior.alcance,
      criteriosAceptacion: anterior.criteriosAceptacion,
    },
    datosNuevos: {
      alcance: actualizado.alcance,
      criteriosAceptacion: actualizado.criteriosAceptacion,
    },
    direccionIp: actor.direccionIp,
  });

  return actualizado;
}


async function verificarContextoNoActivo(id: string, organizacionId: string): Promise<void> {
  const contexto = await obtenerContexto(id, organizacionId);
  if (contexto.activo) {
    throw new AppError(
      "No se puede modificar la configuración de un contexto ya activo",
      409
    );
  }
}

export async function reemplazarEscalaImpacto(
  id: string,
  organizacionId: string,
  input: ReemplazarEscalaInput,
  actor: ActorAuditoria
): Promise<void> {
  await verificarContextoNoActivo(id, organizacionId);
  await reemplazarEscalasImpacto(id, input.niveles);
  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosNuevos: { escalasImpacto: input.niveles },
    direccionIp: actor.direccionIp,
  });
}

export async function reemplazarEscalaProbabilidad(
  id: string,
  organizacionId: string,
  input: ReemplazarEscalaInput,
  actor: ActorAuditoria
): Promise<void> {
  await verificarContextoNoActivo(id, organizacionId);
  await reemplazarEscalasProbabilidad(id, input.niveles);
  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosNuevos: { escalasProbabilidad: input.niveles },
    direccionIp: actor.direccionIp,
  });
}

export async function reemplazarMatrizRiesgo(
  id: string,
  organizacionId: string,
  input: ReemplazarMatrizInput,
  actor: ActorAuditoria
): Promise<void> {
  await verificarContextoNoActivo(id, organizacionId);
  await reemplazarMatriz(id, input.celdas);
  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "EDITAR",
    datosNuevos: { matriz: input.celdas },
    direccionIp: actor.direccionIp,
  });
}

export async function activarContexto(
  id: string,
  organizacionId: string,
  actor: ActorAuditoria
): Promise<Contexto> {
  const contexto = await obtenerContexto(id, organizacionId);

  if (contexto.activo) {
    throw new AppError("El contexto ya se encuentra activo", 409);
  }

  const [totalImpacto, totalProbabilidad, totalMatriz] = await Promise.all([
    contarEscalasImpacto(id),
    contarEscalasProbabilidad(id),
    contarMatriz(id),
  ]);

  if (totalImpacto !== 5 || totalProbabilidad !== 5 || totalMatriz !== 25) {
    throw new AppError(
      "El contexto está incompleto: se requieren las 5 escalas de impacto, " +
        "las 5 escalas de probabilidad y las 25 combinaciones de la matriz de riesgo " +
        "antes de poder activarlo",
      409
    );
  }

  const activado = await activarContextoTransaccion(id, organizacionId);

  await registrarAuditoria({
    usuarioId: actor.usuarioId,
    organizacionId,
    entidad: ENTIDAD,
    entidadId: id,
    accion: "APROBAR",
    datosAnteriores: { activo: false },
    datosNuevos: { activo: true },
    direccionIp: actor.direccionIp,
  });

  return activado;
}
