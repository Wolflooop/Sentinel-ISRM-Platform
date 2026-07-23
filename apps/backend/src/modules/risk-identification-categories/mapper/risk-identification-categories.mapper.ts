import { CategoriaIdentificacionRiesgo } from "../types/risk-identification-categories.types";
import { CategoriaIdentificacionResponseDTO } from "../dto/risk-identification-categories.dto";

export function toCategoriaIdentificacionResponseDTO(
  categoria: CategoriaIdentificacionRiesgo
): CategoriaIdentificacionResponseDTO {
  return { id: categoria.id, nombre: categoria.nombre, descripcion: categoria.descripcion };
}

export function toCategoriaIdentificacionResponseListDTO(
  categorias: CategoriaIdentificacionRiesgo[]
): CategoriaIdentificacionResponseDTO[] {
  return categorias.map(toCategoriaIdentificacionResponseDTO);
}
