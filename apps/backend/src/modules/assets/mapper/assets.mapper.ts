import { ActivoConRelaciones, CategoriaActivo } from "../types/assets.types";
import { ActivoResponseDTO, CategoriaActivoResponseDTO } from "../dto/assets.dto";

export function toActivoResponseDTO(activo: ActivoConRelaciones): ActivoResponseDTO {
  return {
    id: activo.id,
    nombre: activo.nombre,
    descripcion: activo.descripcion,
    ubicacion: activo.ubicacion,
    criticidad: activo.criticidad,
    valorEconomicoEstimado: activo.valorEconomicoEstimado,
    estado: activo.estado,
    categoria: { id: activo.categoria.id, nombre: activo.categoria.nombre },
    usuarioResponsable: {
      id: activo.usuarioResponsable.id,
      nombre: activo.usuarioResponsable.nombre,
    },
  };
}

export function toActivoResponseListDTO(activos: ActivoConRelaciones[]): ActivoResponseDTO[] {
  return activos.map(toActivoResponseDTO);
}

export function toCategoriaActivoResponseDTO(
  categoria: CategoriaActivo
): CategoriaActivoResponseDTO {
  return { id: categoria.id, nombre: categoria.nombre, descripcion: categoria.descripcion };
}

export function toCategoriaActivoResponseListDTO(
  categorias: CategoriaActivo[]
): CategoriaActivoResponseDTO[] {
  return categorias.map(toCategoriaActivoResponseDTO);
}
