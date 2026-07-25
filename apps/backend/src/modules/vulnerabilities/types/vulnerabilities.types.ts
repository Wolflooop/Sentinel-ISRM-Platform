export interface CategoriaVulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Vulnerabilidad {
  id: string;
  organizacionId: string | null;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  severidad: number;
  referenciaCVE: string | null;
  esPredefinida: boolean;
}

export interface VulnerabilidadConRelaciones extends Vulnerabilidad {
  categoria: { id: string; nombre: string };
}

export interface FiltrosVulnerabilidades {
  categoriaId?: string;
  severidad?: number;
  busqueda?: string;
}

export interface CrearVulnerabilidadParams {
  organizacionId: string;
  categoriaId: string;
  nombre: string;
  descripcion?: string;
  severidad: number;
  referenciaCVE?: string;
}

export interface ActualizarVulnerabilidadParams {
  categoriaId?: string;
  nombre?: string;
  descripcion?: string;
  severidad?: number;
  referenciaCVE?: string;
}
