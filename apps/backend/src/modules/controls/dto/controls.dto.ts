export interface ControlResponseDTO {
  id: string;
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
  responsable: {
    id: string;
    nombre: string;
    email: string;
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
