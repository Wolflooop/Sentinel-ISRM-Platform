export type TipoControl = "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
export type EstadoImplementacionControl = "NO_INICIADO" | "EN_PROGRESO" | "IMPLEMENTADO" | "VERIFICADO";

export interface ControlConRelaciones {
  id: string;
  organizacionId: string | null;
  codigoIso27001: string | null;
  nombre: string;
  tipo: TipoControl;
  estadoImplementacion: EstadoImplementacionControl;
  fechaImplementacion: Date | null;
  observaciones: string | null;
  descripcionImplementacion: string | null;
  responsableId: string | null;
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

export interface CrearControlParams {
  organizacionId: string;
  codigoIso27001: string | null;
  nombre: string;
  tipo: TipoControl;
  estadoImplementacion: EstadoImplementacionControl;
  fechaImplementacion: Date | null;
  observaciones: string | null;
  descripcionImplementacion: string | null;
  responsableId: string | null;
}

export interface ActualizarControlParams {
  codigoIso27001?: string | null;
  nombre?: string;
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  fechaImplementacion?: Date | null;
  observaciones?: string | null;
  descripcionImplementacion?: string | null;
  responsableId?: string | null;
}

export interface FiltrosControles {
  tipo?: TipoControl;
  estadoImplementacion?: EstadoImplementacionControl;
  responsableId?: string;
}
