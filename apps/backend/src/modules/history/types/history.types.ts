export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO";

export type EstadoImplementacionControl =
  | "NO_APLICADO"
  | "PLANIFICADO"
  | "EN_PROGRESO"
  | "IMPLEMENTADO";

export interface RiesgoHistorialEntrada {
  id: string;
  riesgoId: string;
  estadoAnterior: EstadoRiesgo | null;
  estadoNuevo: EstadoRiesgo;
  comentario: string | null;
  createdAt: Date;
  usuario: {
    id: string;
    nombre: string;
    rol: { nombre: string };
  };
}

export interface ControlHistorialEntrada {
  id: string;
  controlId: string;
  estadoAnterior: EstadoImplementacionControl | null;
  estadoNuevo: EstadoImplementacionControl;
  comentario: string | null;
  createdAt: Date;
  usuario: {
    id: string;
    nombre: string;
    rol: { nombre: string };
  };
}
