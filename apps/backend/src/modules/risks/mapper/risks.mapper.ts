import { RiesgoConRelaciones } from "../types/risks.types";
import { RiesgoResponseDTO } from "../dto/risks.dto";

/**
 * Prisma Model → Mapper → DTO. Aplana `riesgo.aav.{activo,amenaza,
 * vulnerabilidad}` en el nivel superior de la respuesta y descarta
 * cualquier identificador de AAV — el cliente nunca ve esa entidad.
 */
export function toRiesgoResponseDTO(riesgo: RiesgoConRelaciones): RiesgoResponseDTO {
  return {
    id: riesgo.id,
    probabilidad: riesgo.probabilidad,
    impacto: riesgo.impacto,
    valorRiesgo: riesgo.valorRiesgo,
    nivelRiesgoInherente: riesgo.nivelRiesgoInherente,
    nivelRiesgoResidual: riesgo.nivelRiesgoResidual,
    estado: riesgo.estado,
    fechaUltimoCalculo: riesgo.fechaUltimoCalculo.toISOString(),
    creadoEn: riesgo.creadoEn.toISOString(),
    activo: riesgo.aav.activo,
    amenaza: riesgo.aav.amenaza,
    vulnerabilidad: riesgo.aav.vulnerabilidad,
  };
}

export function toRiesgoResponseListDTO(riesgos: RiesgoConRelaciones[]): RiesgoResponseDTO[] {
  return riesgos.map(toRiesgoResponseDTO);
}
