export type OrigenAmenaza = "INTERNO" | "EXTERNO";

export interface CategoriaAmenaza {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Amenaza {
  id: string;
  nombre: string;
  descripcion: string | null;
  origen: OrigenAmenaza;
  esPredefinida: boolean;
  esPropia: boolean;
  categoria: { id: string; nombre: string };
}

export interface FiltrosAmenazas {
  categoriaId?: string;
  origen?: OrigenAmenaza;
  busqueda?: string;
}
