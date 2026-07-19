export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO";

export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

/** Nunca incluye un identificador de AAV — esa entidad no se expone. */
export interface Riesgo {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: NivelRiesgo;
  nivelRiesgoResidual: NivelRiesgo | null;
  estado: EstadoRiesgo;
  fechaUltimoCalculo: string;
  creadoEn: string;
  activo: { id: string; nombre: string };
  amenaza: { id: string; nombre: string };
  vulnerabilidad: { id: string; nombre: string };
}

export interface FiltrosRiesgos {
  estado?: EstadoRiesgo;
  nivelRiesgoInherente?: NivelRiesgo;
}

export interface RiesgoHistorialEntrada {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { id: string; nombre: string; rol: string };
}
