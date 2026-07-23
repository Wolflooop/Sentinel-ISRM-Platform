import { AppError } from "../../../shared/AppError";
import {
  findResolucionesDeOrganizacion,
  findRiesgoParaResolucion,
  crearResolucion,
} from "../repository/risk-resolutions.repository";
import { CrearResolucionInput } from "../schema/risk-resolutions.schema";
import { ResolucionRiesgoConRelaciones, FiltrosResoluciones } from "../types/risk-resolutions.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarResoluciones(
  organizacionId: string,
  filtros: FiltrosResoluciones
): Promise<ResolucionRiesgoConRelaciones[]> {
  return findResolucionesDeOrganizacion(organizacionId, filtros);
}

// Reglas de negocio (punto 9 del prompt: un riesgo puede resolverse,
// reabrirse y volver a resolverse — 1:N, nunca 1:1):
// - RESOLUCION solo es válida si el riesgo NO está ya CERRADO.
// - REAPERTURA solo es válida si el riesgo SÍ está CERRADO.
export async function crearNuevaResolucion(
  organizacionId: string,
  input: CrearResolucionInput,
  actor: ActorAuditoria
): Promise<ResolucionRiesgoConRelaciones> {
  const riesgo = await findRiesgoParaResolucion(input.riesgoId, organizacionId);
  if (!riesgo) {
    throw new AppError("El riesgo especificado no existe en esta organización", 404);
  }

  if (input.tipo === "RESOLUCION" && riesgo.estado === "CERRADO") {
    throw new AppError("El riesgo ya se encuentra resuelto (CERRADO)", 409);
  }
  if (input.tipo === "REAPERTURA" && riesgo.estado !== "CERRADO") {
    throw new AppError("Solo se puede reabrir un riesgo que se encuentre CERRADO", 409);
  }

  return crearResolucion({
    riesgoId: input.riesgoId,
    tipo: input.tipo,
    justificacion: input.justificacion,
    usuarioId: actor.usuarioId,
    organizacionId,
    direccionIp: actor.direccionIp,
  });
}
