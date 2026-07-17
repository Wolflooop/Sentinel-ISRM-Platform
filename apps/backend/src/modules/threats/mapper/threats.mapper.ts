import { AmenazaConRelaciones, CategoriaAmenaza } from "../types/threats.types";
import { AmenazaResponseDTO, CategoriaAmenazaResponseDTO } from "../dto/threats.dto";


export function toAmenazaResponseDTO(
  amenaza: AmenazaConRelaciones,
  organizacionIdSolicitante: string
): AmenazaResponseDTO {
  return {
    id: amenaza.id,
    nombre: amenaza.nombre,
    descripcion: amenaza.descripcion,
    origen: amenaza.origen,
    esPredefinida: amenaza.esPredefinida,
    esPropia: amenaza.organizacionId === organizacionIdSolicitante,
    categoria: { id: amenaza.categoria.id, nombre: amenaza.categoria.nombre },
  };
}

export function toAmenazaResponseListDTO(
  amenazas: AmenazaConRelaciones[],
  organizacionIdSolicitante: string
): AmenazaResponseDTO[] {
  return amenazas.map((amenaza) => toAmenazaResponseDTO(amenaza, organizacionIdSolicitante));
}

export function toCategoriaAmenazaResponseDTO(
  categoria: CategoriaAmenaza
): CategoriaAmenazaResponseDTO {
  return { id: categoria.id, nombre: categoria.nombre, descripcion: categoria.descripcion };
}

export function toCategoriaAmenazaResponseListDTO(
  categorias: CategoriaAmenaza[]
): CategoriaAmenazaResponseDTO[] {
  return categorias.map(toCategoriaAmenazaResponseDTO);
}
