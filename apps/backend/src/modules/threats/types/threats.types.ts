
export type OrigenAmenaza = "INTERNO" | "EXTERNO";

export interface CategoriaAmenaza {
  id: string;
  nombre: string;
  descripcion: string | null;
}


export interface Amenaza {
  id: string;
  organizacionId: string | null;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  origen: OrigenAmenaza;
  esPredefinida: boolean;
}

export interface AmenazaConRelaciones extends Amenaza {
  categoria: { id: string; nombre: string };
}

export interface FiltrosAmenazas {
  categoriaId?: string;
  origen?: OrigenAmenaza;
  busqueda?: string;
}

export interface CrearAmenazaParams {
  organizacionId: string;
  categoriaId: string;
  nombre: string;
  descripcion?: string;
  origen: OrigenAmenaza;
}

export interface ActualizarAmenazaParams {
  categoriaId?: string;
  nombre?: string;
  descripcion?: string;
  origen?: OrigenAmenaza;
}
