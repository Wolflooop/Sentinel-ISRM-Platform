/**
 * Sin `esPropia`/`esPredefinida` (a diferencia de threats.types.ts): el
 * catálogo de Vulnerabilidad es 100% global, sin distinción propia/ajena.
 */
export interface CategoriaVulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Vulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
  severidad: number;
  referenciaCVE: string | null;
  categoria: { id: string; nombre: string };
}

export interface FiltrosVulnerabilidades {
  categoriaId?: string;
  severidad?: number;
  busqueda?: string;
}
