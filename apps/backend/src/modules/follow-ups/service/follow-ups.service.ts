import { AppError } from "../../../shared/AppError";
import {
  findSeguimientos,
  existeRiesgoDeOrganizacion,
  existeTratamientoDeOrganizacion,
  existeControlVisible,
  crearSeguimiento,
} from "../repository/follow-ups.repository";
import { CrearSeguimientoInput, FiltrosSeguimientosInput } from "../schema/follow-ups.schema";
import { SeguimientoConRelaciones } from "../types/follow-ups.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

async function validarDestino(
  destino: { riesgoId?: string | null; tratamientoId?: string | null; controlId?: string | null },
  organizacionId: string
): Promise<void> {
  if (destino.riesgoId) {
    const existe = await existeRiesgoDeOrganizacion(destino.riesgoId, organizacionId);
    if (!existe) throw new AppError("El riesgo especificado no existe en esta organización", 404);
    return;
  }
  if (destino.tratamientoId) {
    const existe = await existeTratamientoDeOrganizacion(destino.tratamientoId, organizacionId);
    if (!existe) throw new AppError("El tratamiento especificado no existe en esta organización", 404);
    return;
  }
  if (destino.controlId) {
    const existe = await existeControlVisible(destino.controlId, organizacionId);
    if (!existe) throw new AppError("El control especificado no existe o no es visible para esta organización", 404);
    return;
  }
  throw new AppError("Debe indicar exactamente un destino", 422);
}

export async function listarSeguimientos(
  organizacionId: string,
  filtros: FiltrosSeguimientosInput
): Promise<SeguimientoConRelaciones[]> {
  await validarDestino(filtros, organizacionId);
  return findSeguimientos(filtros);
}

export async function crearNuevoSeguimiento(
  organizacionId: string,
  input: CrearSeguimientoInput,
  actor: ActorAuditoria
): Promise<SeguimientoConRelaciones> {
  await validarDestino(input, organizacionId);

  return crearSeguimiento({
    riesgoId: input.riesgoId ?? null,
    tratamientoId: input.tratamientoId ?? null,
    controlId: input.controlId ?? null,
    usuarioId: actor.usuarioId,
    descripcion: input.descripcion,
    organizacionId,
    direccionIp: actor.direccionIp,
  });
}
