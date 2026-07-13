export interface ActivoResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  criticidad: number;
  valorEconomicoEstimado: string | null;
  estado: string;
  categoria: { id: string; nombre: string };
  usuarioResponsable: { id: string; nombre: string };
}

export interface CategoriaActivoResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
}
