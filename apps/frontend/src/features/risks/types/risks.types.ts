export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO"
  | "REABIERTO";

export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
export type OrigenRiesgo = "AAV" | "MANUAL";

export interface EvaluacionActualResumen {
  id: string;
  tipoEvaluacion: "INHERENTE" | "RESIDUAL";
  probabilidad: number;
  impacto: number;
  valorCalculado: number;
  nivelRiesgo: NivelRiesgo;
  fechaEvaluacion: string;
}

// V2: un riesgo ya no tiene siempre AAV — origen puede ser MANUAL.
export interface Riesgo {
  id: string;
  origen: OrigenRiesgo;
  titulo: string | null;
  descripcion: string | null;
  justificacionOrigen: string | null;
  estado: EstadoRiesgo;
  creadoEn: string;
  creador: { id: string; nombre: string };
  responsable: { id: string; nombre: string };
  categoriaIdentificacion: { id: string; nombre: string } | null;
  activo: { id: string; nombre: string } | null;
  amenaza: { id: string; nombre: string } | null;
  vulnerabilidad: { id: string; nombre: string } | null;
  evaluacionActual: EvaluacionActualResumen | null;
}

export interface FiltrosRiesgos {
  estado?: EstadoRiesgo;
  origen?: OrigenRiesgo;
  responsableId?: string;
}

export interface RiesgoHistorialEntrada {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  usuario: { id: string; nombre: string; rol: string };
}

export interface CategoriaIdentificacionRiesgo {
  id: string;
  nombre: string;
  descripcion: string | null;
}
