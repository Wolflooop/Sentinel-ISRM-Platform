export type TipoControl = "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
export type EstadoImplementacionControl =
  | "NO_APLICADO"
  | "PLANIFICADO"
  | "EN_PROGRESO"
  | "IMPLEMENTADO";

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
}

export interface FiltrosControles {
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
}

export interface ActualizarControlInput {
  codigoIso27001?: string | null;
  nombre?: string;
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  fechaImplementacion?: string | null;
  observaciones?: string | null;
  descripcionImplementacion?: string | null;
  // Obligatorio solo cuando estadoImplementacion cambia respecto al valor
  // actual — el backend valida esa condición (ver Fase 9).
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
