export type EstadoActivo = "ACTIVO" | "INACTIVO" | "RETIRADO";

export interface CategoriaActivo {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Activo {
  id: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  criticidad: number;
  valorEconomicoEstimado: string | null;
  estado: EstadoActivo;
  categoria: { id: string; nombre: string };
  usuarioResponsable: { id: string; nombre: string };
}

export interface FiltrosActivos {
  categoriaId?: string;
  criticidad?: number;
  estado?: EstadoActivo;
  busqueda?: string;
}
