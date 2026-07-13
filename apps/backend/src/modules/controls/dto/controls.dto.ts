/** DTO de salida para controles. */
export interface ControlResponseDTO {
  id: string;
  organizacionId: string | null;
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
