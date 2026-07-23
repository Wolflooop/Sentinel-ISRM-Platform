export type TipoControl = "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
export type EstadoImplementacionControl =
  | "NO_INICIADO"
  | "EN_PROGRESO"
  | "IMPLEMENTADO"
  | "VERIFICADO";

export interface Control {
  id: string;
  esPropia: boolean;
  codigoIso27001: string | null;
  nombre: string;
  tipo: TipoControl;
  estadoImplementacion: EstadoImplementacionControl;
  fechaImplementacion: string | null;
  observaciones: string | null;
  descripcionImplementacion: string | null;
  organizacion: {
    id: string;
    nombre: string;
  } | null;
  // V2 (punto 7 del prompt): responsable operativo del control.
  responsable: {
    id: string;
    nombre: string;
    email: string;
  } | null;
}

export interface FiltrosControles {
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  responsableId?: string;
}

export interface ActualizarControlInput {
  codigoIso27001?: string | null;
  nombre?: string;
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  fechaImplementacion?: string | null;
  observaciones?: string | null;
  descripcionImplementacion?: string | null;
  responsableId?: string | null;
  // Obligatorio solo cuando estadoImplementacion cambia respecto al valor
  // actual — el backend valida esa condición.
  comentario?: string;
}

export interface ControlHistorialEntrada {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { id: string; nombre: string; rol: string };
}
