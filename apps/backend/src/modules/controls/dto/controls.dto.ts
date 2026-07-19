/** DTO de salida para controles. */
export interface ControlResponseDTO {
  id: string;
  /**
   * Derivado en el Mapper (no persistido): indica si el control pertenece a
   * la organización del solicitante (`true`) o es una entrada del catálogo
   * global de solo lectura para los tenants (`false`). Permite al frontend
   * decidir si mostrar acciones de editar/eliminar sin exponer
   * `organizacionId` crudo en la respuesta.
   */
  esPropia: boolean;
  codigoIso27001: string | null;
  nombre: string;
  tipo: string;
  estadoImplementacion: string;
  fechaImplementacion: string | null;
  observaciones: string | null;
  descripcionImplementacion: string | null;
  organizacion: {
    id: string;
    nombre: string;
  } | null;
}

export interface ControlHistorialResponseDTO {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { id: string; nombre: string; rol: string };
}
