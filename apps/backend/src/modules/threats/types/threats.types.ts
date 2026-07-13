/**
 * Tipos internos del módulo threats (Amenazas). No se importa
 * `@prisma/client` aquí — el enum se redefine como unión de string literal,
 * igual que en assets.types.ts / context.types.ts. Solo repository.ts toca
 * Prisma.
 */
export type OrigenAmenaza = "INTERNO" | "EXTERNO";

export interface CategoriaAmenaza {
  id: string;
  nombre: string;
  descripcion: string | null;
}

/**
 * `organizacionId: null` = catálogo global (administrado fuera de este
 * módulo — ver schema.prisma). No confundir con "sin organización
 * asignada": es un estado válido y permanente para las entradas globales.
 */
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
