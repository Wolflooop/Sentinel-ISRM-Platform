export type ResultadoEvaluacion = "ACEPTABLE" | "NO_ACEPTABLE";
export type TipoEvaluacion = "INHERENTE" | "RESIDUAL";
export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface Evaluacion {
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
  fechaEvaluacion: string;
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

export interface CrearEvaluacionFormValues {
  riesgoId: string;
  contextoId: string;
  tipoEvaluacion: TipoEvaluacion;
  probabilidad: number;
  impacto: number;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  // Independiente de `justificacion`: comentario del historial del riesgo.
  comentario: string;
}

export interface FiltrosEvaluaciones {
  riesgoId?: string;
  tipoEvaluacion?: TipoEvaluacion;
}
