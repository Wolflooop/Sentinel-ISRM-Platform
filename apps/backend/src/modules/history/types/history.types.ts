export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO"
  | "REABIERTO";

export type EstadoImplementacionControl =
  | "NO_INICIADO"
  | "EN_PROGRESO"
  | "IMPLEMENTADO"
  | "VERIFICADO";

export interface UsuarioHistorialResumen {
  id: string;
  nombre: string;
  rol: {
    nombre: string;
  };
}

export interface RiesgoHistorialEntrada {
  id: string;
  riesgoId: string;
  estadoAnterior: EstadoRiesgo | null;
  estadoNuevo: EstadoRiesgo;
  comentario: string | null;
  createdAt: Date;
  usuario: UsuarioHistorialResumen;
}

export interface ControlHistorialEntrada {
  id: string;
  controlId: string;
  estadoAnterior: EstadoImplementacionControl | null;
  estadoNuevo: EstadoImplementacionControl;
  comentario: string | null;
  createdAt: Date;
  usuario: UsuarioHistorialResumen;
}