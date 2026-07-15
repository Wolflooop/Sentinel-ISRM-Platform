export type TipoControl = "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
export type EstadoImplementacionControl =
  | "NO_APLICADO"
  | "PLANIFICADO"
  | "EN_PROGRESO"
  | "IMPLEMENTADO";

export interface Control {
  id: string;
  organizacionId: string | null;
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
  organizacionId?: string;
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
}

export interface ActualizarControlInput {
  organizacionId?: string | null;
  codigoIso27001?: string | null;
  nombre?: string;
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  fechaImplementacion?: string | null;
  observaciones?: string | null;
  descripcionImplementacion?: string | null;
}
