/**
 * Nunca incluye `aavId` ni ningún identificador de
 * `ActivoAmenazaVulnerabilidad` — esa entidad es un detalle interno, no un
 * recurso propio (ver PASO 1). Solo se exponen los nombres resueltos de
 * activo/amenaza/vulnerabilidad, necesarios para que el usuario identifique
 * el riesgo sin administrar la combinación subyacente.
 */
export interface RiesgoResponseDTO {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: string;
  nivelRiesgoResidual: string | null;
  estado: string;
  fechaUltimoCalculo: string;
  creadoEn: string;
  activo: { id: string; nombre: string };
  amenaza: { id: string; nombre: string };
  vulnerabilidad: { id: string; nombre: string };
}
