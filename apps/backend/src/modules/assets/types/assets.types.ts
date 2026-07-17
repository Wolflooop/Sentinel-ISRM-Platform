
export type EstadoActivo = "ACTIVO" | "INACTIVO" | "RETIRADO";

export interface CategoriaActivo {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface Activo {
  id: string;
  organizacionId: string;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  usuarioResponsableId: string;
  ubicacion: string | null;
  criticidad: number;
  valorEconomicoEstimado: string | null; // Decimal serializado como string
  estado: EstadoActivo;
}

export interface ActivoConRelaciones extends Activo {
  categoria: { id: string; nombre: string };
  usuarioResponsable: { id: string; nombre: string };
}

export interface FiltrosActivos {
  categoriaId?: string;
  criticidad?: number;
  estado?: EstadoActivo;
  busqueda?: string;
}

export interface CrearActivoParams {
  organizacionId: string;
  categoriaId: string;
  nombre: string;
  descripcion?: string;
  usuarioResponsableId: string;
  ubicacion?: string;
  criticidad: number;
  valorEconomicoEstimado?: number;
}

export interface ActualizarActivoParams {
  categoriaId?: string;
  nombre?: string;
  descripcion?: string;
  usuarioResponsableId?: string;
  ubicacion?: string;
  criticidad?: number;
  valorEconomicoEstimado?: number;
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
