import { VulnerabilidadConRelaciones, CategoriaVulnerabilidad } from "../types/vulnerabilities.types";
import { VulnerabilidadResponseDTO, CategoriaVulnerabilidadResponseDTO } from "../dto/vulnerabilities.dto";

export function toVulnerabilidadResponseDTO(
  vulnerabilidad: VulnerabilidadConRelaciones
): VulnerabilidadResponseDTO {
  return {
    id: vulnerabilidad.id,
    nombre: vulnerabilidad.nombre,
    descripcion: vulnerabilidad.descripcion,
    severidad: vulnerabilidad.severidad,
    referenciaCVE: vulnerabilidad.referenciaCVE,
    categoria: { id: vulnerabilidad.categoria.id, nombre: vulnerabilidad.categoria.nombre },
  };
}

export function toVulnerabilidadResponseListDTO(
  vulnerabilidades: VulnerabilidadConRelaciones[]
): VulnerabilidadResponseDTO[] {
  return vulnerabilidades.map(toVulnerabilidadResponseDTO);
}

export function toCategoriaVulnerabilidadResponseDTO(
  categoria: CategoriaVulnerabilidad
): CategoriaVulnerabilidadResponseDTO {
  return { id: categoria.id, nombre: categoria.nombre, descripcion: categoria.descripcion };
}

export function toCategoriaVulnerabilidadResponseListDTO(
  categorias: CategoriaVulnerabilidad[]
): CategoriaVulnerabilidadResponseDTO[] {
  return categorias.map(toCategoriaVulnerabilidadResponseDTO);
}
