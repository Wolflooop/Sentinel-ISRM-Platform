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
} from "../repository/context.repository";
import { Contexto, ContextoConDetalle } from "../types/context.types";
import {
  CrearContextoInput,
  ActualizarContextoInput,
  ReemplazarEscalaInput,
  ReemplazarMatrizInput,
} from "../schema/context.schema";

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
  const contexto = await crearContexto(
    { organizacionId, ...input },
    { usuarioId: actor.usuarioId, organizacionId, direccionIp: actor.direccionIp }
  );

  return contexto;
}

export async function actualizarContextoExistente(
  id: string,
  organizacionId: string,
  input: ActualizarContextoInput,
  actor: ActorAuditoria
): Promise<Contexto> {
  const anterior = await obtenerContexto(id, organizacionId);

  const actualizado = await actualizarContexto(
    id,
    input,
    { usuarioId: actor.usuarioId, organizacionId, direccionIp: actor.direccionIp },
    { alcance: anterior.alcance, criteriosAceptacion: anterior.criteriosAceptacion }
  );

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
  await reemplazarEscalasImpacto(id, input.niveles, {
    usuarioId: actor.usuarioId,
    organizacionId,
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
  await reemplazarEscalasProbabilidad(id, input.niveles, {
    usuarioId: actor.usuarioId,
    organizacionId,
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
  await reemplazarMatriz(id, input.celdas, {
    usuarioId: actor.usuarioId,
    organizacionId,
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

  const activado = await activarContextoTransaccion(id, organizacionId, {
    usuarioId: actor.usuarioId,
    organizacionId,
    direccionIp: actor.direccionIp,
  });

  return activado;
}
