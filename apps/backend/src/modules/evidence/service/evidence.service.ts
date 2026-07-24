import fs from "fs";
import { AppError } from "../../../shared/AppError";
import { canManageRegistro, UsuarioParaOwnership } from "../../../shared/ownership";
import {
  findEvidencias,
  findEvidenciaPorId,
  existeRiesgoDeOrganizacion,
  existeTratamientoDeOrganizacion,
  existeControlVisible,
  findResponsableDelDestino,
  perteneceAOrganizacion,
  crearEvidencia,
  validarEvidencia,
} from "../repository/evidence.repository";
import { CrearEvidenciaInput, FiltrosEvidenciasInput, ValidarEvidenciaInput } from "../schema/evidence.schema";
import { EvidenciaConRelaciones } from "../types/evidence.types";
import { rutaAbsolutaEvidencia } from "../../../middleware/uploadEvidencia";

interface ActorAuditoria extends UsuarioParaOwnership {
  direccionIp: string;
}

interface ArchivoSubido {
  filename: string;
  originalname: string;
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

export async function listarEvidencias(
  organizacionId: string,
  filtros: FiltrosEvidenciasInput
): Promise<EvidenciaConRelaciones[]> {
  await validarDestino(filtros, organizacionId);
  return findEvidencias(filtros);
}

export async function obtenerEvidencia(
  id: string,
  organizacionId: string
): Promise<EvidenciaConRelaciones> {
  const evidencia = await findEvidenciaPorId(id);
  if (!evidencia || !(await perteneceAOrganizacion(evidencia, organizacionId))) {
    throw new AppError("Evidencia no encontrada", 404);
  }
  return evidencia;
}

export async function obtenerRutaDescarga(id: string, organizacionId: string): Promise<{ ruta: string; nombreOriginal: string }> {
  const evidencia = await obtenerEvidencia(id, organizacionId);
  const ruta = rutaAbsolutaEvidencia(evidencia.rutaArchivo);
  if (!fs.existsSync(ruta)) {
    throw new AppError("El archivo de evidencia no está disponible en el servidor", 404);
  }
  return { ruta, nombreOriginal: evidencia.nombreArchivo };
}

export async function crearNuevaEvidencia(
  organizacionId: string,
  input: CrearEvidenciaInput,
  archivo: ArchivoSubido,
  actor: ActorAuditoria
): Promise<EvidenciaConRelaciones> {
  await validarDestino(input, organizacionId);

  // Fase 3B: subir una evidencia es gestionar el registro destino (riesgo,
  // tratamiento o control). Se resuelve el responsable actual de ese
  // destino específico.
  const responsableId = await findResponsableDelDestino(input, organizacionId);
  if (!canManageRegistro(actor, { responsableId })) {
    throw new AppError(
      "Acceso denegado: solo el responsable actual del registro o un Administrador TIC pueden subir una evidencia",
      403
    );
  }

  return crearEvidencia({
    riesgoId: input.riesgoId ?? null,
    tratamientoId: input.tratamientoId ?? null,
    controlId: input.controlId ?? null,
    nombreArchivo: archivo.originalname,
    rutaArchivo: archivo.filename,
    subidoPorId: actor.usuarioId,
    organizacionId,
    direccionIp: actor.direccionIp,
  });
}

export async function validarEvidenciaExistente(
  id: string,
  organizacionId: string,
  input: ValidarEvidenciaInput,
  actor: ActorAuditoria
): Promise<EvidenciaConRelaciones> {
  // Fase 3B: validar/rechazar una evidencia es una acción de control de
  // calidad reservada a Administrador TIC, no una gestión ordinaria del
  // registro — un usuario común nunca valida evidencias, ni siquiera las
  // suyas propias.
  if (actor.tipoRol !== "ADMIN_TIC") {
    throw new AppError(
      "Acceso denegado: solo un Administrador TIC puede validar una evidencia",
      403
    );
  }

  const evidencia = await obtenerEvidencia(id, organizacionId);

  if (evidencia.estado !== "SUBIDA") {
    throw new AppError("Solo se puede validar una evidencia que se encuentre en estado SUBIDA", 409);
  }

  return validarEvidencia({
    evidenciaId: evidencia.id,
    estado: input.estado,
    comentarioValidacion: input.comentarioValidacion ?? null,
    validadoPorId: actor.usuarioId,
    organizacionId,
    direccionIp: actor.direccionIp,
  });
}
