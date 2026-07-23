export type ResultadoEvaluacion = "ACEPTABLE" | "NO_ACEPTABLE";
export type TipoEvaluacion = "INHERENTE" | "RESIDUAL";
export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface EvaluacionConRelaciones {
  id: string;
  riesgoId: string;
  contextoId: string;
  tipoEvaluacion: TipoEvaluacion;
  probabilidad: number;
  impacto: number;
  valorCalculado: number;
  nivelRiesgo: NivelRiesgo;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  usuarioId: string;
  fechaEvaluacion: Date;
  riesgo: {
    id: string;
    estado: string;
    origen: string;
    titulo: string | null;
  };
  contexto: {
    id: string;
    alcance: string;
    activo: boolean;
  };
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CrearEvaluacionParams {
  riesgoId: string;
  contextoId: string;
  tipoEvaluacion: TipoEvaluacion;
  probabilidad: number;
  impacto: number;
  valorCalculado: number;
  nivelRiesgo: NivelRiesgo;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  // Independiente de `justificacion` — es el comentario que se registra en
  // el historial del riesgo.
  comentario: string;
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosEvaluaciones {
  riesgoId?: string;
  tipoEvaluacion?: TipoEvaluacion;
}

export interface CeldaMatrizResumen {
  nivelResultante: NivelRiesgo;
}
