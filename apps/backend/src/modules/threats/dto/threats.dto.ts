export interface AmenazaResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
  origen: string;
  esPredefinida: boolean;
  /**
   * Derivado en el Mapper (no persistido): indica si la amenaza pertenece a
   * la organización del solicitante (`true`) o es una entrada del catálogo
   * global de solo lectura para los tenants (`false`). Permite al frontend
   * decidir si mostrar acciones de editar/eliminar sin exponer
   * `organizacionId` crudo en la respuesta.
   */
  esPropia: boolean;
  categoria: { id: string; nombre: string };
}

export interface CategoriaAmenazaResponseDTO {
  id: string;
  nombre: string;
  descripcion: string | null;
}
