import { AppError } from "../../../shared/AppError";
import {
  findRiesgosDeOrganizacion,
  findRiesgoDeOrganizacionPorId,
  findActivoDeOrganizacion,
  findAmenazaVisible,
  findVulnerabilidadVisible,
  findContextoActivoDeOrganizacion,
  findCeldaMatriz,
  findCategoriaIdentificacion,
  findUsuarioDeOrganizacion,
  crearAavYRiesgo,
  crearRiesgoManual,
  reasignarResponsableDeRiesgo,
  findHistorialDeRiesgo,
  RiesgoDuplicadoParaAavError,
} from "../repository/risks.repository";
import { RiesgoConRelaciones, FiltrosRiesgos } from "../types/risks.types";
import { RiesgoHistorialEntrada } from "../../history/types/history.types";
import { CrearRiesgoInput } from "../schema/risks.schema";

interface ActorAuditoria {
  usuarioId: string;
  direccionIp: string;
}

export async function listarRiesgos(
  organizacionId: string,
  filtros: FiltrosRiesgos
): Promise<RiesgoConRelaciones[]> {
  return findRiesgosDeOrganizacion(organizacionId, filtros);
}

export async function obtenerRiesgo(
  id: string,
  organizacionId: string
): Promise<RiesgoConRelaciones> {
  const riesgo = await findRiesgoDeOrganizacionPorId(id, organizacionId);
  if (!riesgo) {
    throw new AppError("Riesgo no encontrado", 404);
  }
  return riesgo;
}

async function validarResponsable(responsableId: string, organizacionId: string): Promise<void> {
  const responsable = await findUsuarioDeOrganizacion(responsableId, organizacionId);
  if (!responsable) {
    throw new AppError("El responsable indicado no pertenece a esta organización", 404);
  }
}

async function crearRiesgoOrigenAav(
  organizacionId: string,
  input: Extract<CrearRiesgoInput, { origen: "AAV" }>,
  actor: ActorAuditoria
): Promise<RiesgoConRelaciones> {
  const activo = await findActivoDeOrganizacion(input.activoId, organizacionId);
  if (!activo) {
    throw new AppError("El activo especificado no existe en esta organización", 404);
  }

  const amenaza = await findAmenazaVisible(input.amenazaId, organizacionId);
  if (!amenaza) {
    throw new AppError(
      "La amenaza especificada no existe o no está disponible para esta organización",
      404
    );
  }

  const vulnerabilidad = await findVulnerabilidadVisible(input.vulnerabilidadId, organizacionId);
  if (!vulnerabilidad) {
    throw new AppError(
      "La vulnerabilidad especificada no existe o no está disponible para esta organización",
      404
    );
  }

  await validarResponsable(input.responsableId, organizacionId);

  const contexto = await findContextoActivoDeOrganizacion(organizacionId);
  if (!contexto) {
    throw new AppError(
      "La organización no tiene un Contexto ISO activo; no es posible calcular el nivel de riesgo",
      409
    );
  }

  const celda = await findCeldaMatriz(contexto.id, input.probabilidad, input.impacto);
  if (!celda) {
    throw new AppError(
      "El contexto activo no tiene definida esa combinación de probabilidad/impacto en su matriz de riesgo",
      409
    );
  }

  try {
    return await crearAavYRiesgo({
      organizacionId,
      activoId: input.activoId,
      amenazaId: input.amenazaId,
      vulnerabilidadId: input.vulnerabilidadId,
      probabilidad: input.probabilidad,
      impacto: input.impacto,
      nivelRiesgoInherente: celda.nivelResultante,
      responsableId: input.responsableId,
      actor,
    });
  } catch (err) {
    if (err instanceof RiesgoDuplicadoParaAavError) {
      throw new AppError(err.message, 409);
    }
    throw err;
  }
}

async function crearRiesgoOrigenManual(
  organizacionId: string,
  input: Extract<CrearRiesgoInput, { origen: "MANUAL" }>,
  actor: ActorAuditoria
): Promise<RiesgoConRelaciones> {
  const categoria = await findCategoriaIdentificacion(input.categoriaIdentificacionId);
  if (!categoria) {
    throw new AppError("La categoría de identificación especificada no existe", 404);
  }

  await validarResponsable(input.responsableId, organizacionId);

  const contexto = await findContextoActivoDeOrganizacion(organizacionId);
  if (!contexto) {
    throw new AppError(
      "La organización no tiene un Contexto ISO activo; no es posible calcular el nivel de riesgo",
      409
    );
  }

  const celda = await findCeldaMatriz(contexto.id, input.probabilidad, input.impacto);
  if (!celda) {
    throw new AppError(
      "El contexto activo no tiene definida esa combinación de probabilidad/impacto en su matriz de riesgo",
      409
    );
  }

  return crearRiesgoManual({
    organizacionId,
    titulo: input.titulo,
    descripcion: input.descripcion,
    justificacionOrigen: input.justificacionOrigen,
    categoriaIdentificacionId: input.categoriaIdentificacionId,
    probabilidad: input.probabilidad,
    impacto: input.impacto,
    nivelRiesgoInherente: celda.nivelResultante,
    responsableId: input.responsableId,
    actor,
  });
}

export async function crearNuevoRiesgo(
  organizacionId: string,
  input: CrearRiesgoInput,
  actor: ActorAuditoria
): Promise<RiesgoConRelaciones> {
  if (input.origen === "AAV") {
    return crearRiesgoOrigenAav(organizacionId, input, actor);
  }
  return crearRiesgoOrigenManual(organizacionId, input, actor);
}

// V2 (punto 13 del prompt): único punto de la aplicación que puede cambiar
// Riesgo.responsableId. creadorId es inmutable y nunca se toca aquí.
export async function asignarResponsableDeRiesgo(
  riesgoId: string,
  organizacionId: string,
  responsableIdNuevo: string,
  actor: ActorAuditoria
): Promise<RiesgoConRelaciones> {
  await obtenerRiesgo(riesgoId, organizacionId);
  await validarResponsable(responsableIdNuevo, organizacionId);

  return reasignarResponsableDeRiesgo({
    riesgoId,
    responsableIdNuevo,
    organizacionId,
    actor,
  });
}

export async function obtenerHistorialDeRiesgo(
  riesgoId: string,
  organizacionId: string
): Promise<RiesgoHistorialEntrada[]> {
  await obtenerRiesgo(riesgoId, organizacionId);
  return findHistorialDeRiesgo(riesgoId, organizacionId);
}
