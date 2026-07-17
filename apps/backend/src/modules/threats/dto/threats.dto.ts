export interface AmenazaResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  origen: string;
  esPredefinida: boolean;
  
  esPropia: boolean;
  categoria: { id: string; nombre: string };
}

export interface CategoriaAmenazaResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
}
