
export interface CategoriaVulnerabilidad {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Vulnerabilidad {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  severidad: number;
  referenciaCVE: string | null;
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

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  organizacionId: string;
  entidad: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  direccionIp: string;
}
