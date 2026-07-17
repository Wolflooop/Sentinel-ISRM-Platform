import { AppError } from "../../../shared/AppError";
import {
  findRiesgosDeOrganizacion,
  findRiesgoDeOrganizacionPorId,
  findActivoDeOrganizacion,
  findAmenazaVisible,
  findVulnerabilidad,
  findContextoActivoDeOrganizacion,
  findCeldaMatriz,
  crearAavYRiesgo,
  RiesgoDuplicadoParaAavError,
} from "../repository/risks.repository";
import { RiesgoConRelaciones, FiltrosRiesgos } from "../types/risks.types";
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


export async function crearNuevoRiesgo(
  organizacionId: string,
  input: CrearRiesgoInput,
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

  const vulnerabilidad = await findVulnerabilidad(input.vulnerabilidadId);
  if (!vulnerabilidad) {
    throw new AppError("La vulnerabilidad especificada no existe", 404);
  }

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
      actor,
    });
  } catch (err) {
    if (err instanceof RiesgoDuplicadoParaAavError) {
      throw new AppError(err.message, 409);
    }
    throw err;
  }
}
