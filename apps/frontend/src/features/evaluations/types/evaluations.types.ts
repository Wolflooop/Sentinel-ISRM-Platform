export type ResultadoEvaluacion = "ACEPTABLE" | "NO_ACEPTABLE";

export interface Evaluacion {
  id: string;
  riesgoId: string;
  contextoId: string;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  usuarioId: string;
  fechaEvaluacion: string;
  riesgo: {
    id: string;
    valorRiesgo: number;
    nivelRiesgoInherente: string;
    estado: string;
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
  resultado: ResultadoEvaluacion;
  justificacion: string;
  // Independiente de `justificacion`: comentario del historial del riesgo.
  comentario: string;
}

export interface FiltrosEvaluaciones {
  riesgoId?: string;
}
