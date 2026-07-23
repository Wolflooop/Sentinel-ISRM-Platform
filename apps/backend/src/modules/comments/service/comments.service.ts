import { AppError } from "../../../shared/AppError";
import {
  findComentarios,
  existeRiesgoDeOrganizacion,
  existeEvaluacionDeOrganizacion,
  existeTratamientoDeOrganizacion,
  existeControlVisible,
  crearComentario,
} from "../repository/comments.repository";
import { CrearComentarioInput, FiltrosComentariosInput } from "../schema/comments.schema";
import { ComentarioConRelaciones } from "../types/comments.types";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

async function validarDestino(
  destino: { riesgoId?: string | null; evaluacionId?: string | null; tratamientoId?: string | null; controlId?: string | null },
  organizacionId: string
): Promise<void> {
  if (destino.riesgoId) {
    const existe = await existeRiesgoDeOrganizacion(destino.riesgoId, organizacionId);
    if (!existe) throw new AppError("El riesgo especificado no existe en esta organización", 404);
    return;
  }
  if (destino.evaluacionId) {
    const existe = await existeEvaluacionDeOrganizacion(destino.evaluacionId, organizacionId);
    if (!existe) throw new AppError("La evaluación especificada no existe en esta organización", 404);
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

export async function listarComentarios(
  organizacionId: string,
  filtros: FiltrosComentariosInput
): Promise<ComentarioConRelaciones[]> {
  await validarDestino(filtros, organizacionId);
  return findComentarios(filtros);
}

export async function crearNuevoComentario(
  organizacionId: string,
  input: CrearComentarioInput,
  actor: ActorAuditoria
): Promise<ComentarioConRelaciones> {
  await validarDestino(input, organizacionId);

  return crearComentario({
    riesgoId: input.riesgoId ?? null,
    evaluacionId: input.evaluacionId ?? null,
    tratamientoId: input.tratamientoId ?? null,
    controlId: input.controlId ?? null,
    usuarioId: actor.usuarioId,
    contenido: input.contenido,
    organizacionId,
    direccionIp: actor.direccionIp,
  });
}
