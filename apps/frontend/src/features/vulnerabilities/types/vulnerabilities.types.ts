export interface CategoriaVulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
}

// V2 (punto 8 del prompt): catálogo global/organización, idéntico patrón
// a Amenaza — esPredefinida marca el catálogo global sembrado por el
// sistema, esPropia indica si pertenece a la organización del solicitante.
export interface Vulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
  severidad: number;
  referenciaCVE: string | null;
  esPredefinida: boolean;
  esPropia: boolean;
  categoria: { id: string; nombre: string };
}

export interface FiltrosVulnerabilidades {
  categoriaId?: string;
  severidad?: number;
  busqueda?: string;
}
