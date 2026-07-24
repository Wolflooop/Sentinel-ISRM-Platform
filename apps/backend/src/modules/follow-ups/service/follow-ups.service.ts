import { AppError } from "../../../shared/AppError";
import { canManageRegistro, UsuarioParaOwnership } from "../../../shared/ownership";
import {
  findSeguimientos,
  existeRiesgoDeOrganizacion,
  existeTratamientoDeOrganizacion,
  existeControlVisible,
  findResponsableDelDestino,
  crearSeguimiento,
} from "../repository/follow-ups.repository";
import { CrearSeguimientoInput, FiltrosSeguimientosInput } from "../schema/follow-ups.schema";
import { SeguimientoConRelaciones } from "../types/follow-ups.types";

interface ActorAuditoria extends UsuarioParaOwnership {
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

  // Fase 3B: registrar un seguimiento es gestionar el registro destino
  // (riesgo, tratamiento o control). Se resuelve el responsable actual de
  // ese destino específico, no siempre el del riesgo.
  const responsableId = await findResponsableDelDestino(input, organizacionId);
  if (!canManageRegistro(actor, { responsableId })) {
    throw new AppError(
      "Acceso denegado: solo el responsable actual del registro o un Administrador TIC pueden registrar un seguimiento",
      403
    );
  }

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
