export type ResultadoEvaluacion = "ACEPTABLE" | "NO_ACEPTABLE";

export interface EvaluacionConRelaciones {
  id: string;
  riesgoId: string;
  contextoId: string;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  usuarioId: string;
  fechaEvaluacion: Date;
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

export interface CrearEvaluacionParams {
  riesgoId: string;
  contextoId: string;
  resultado: ResultadoEvaluacion;
  justificacion: string;
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosEvaluaciones {
  riesgoId?: string;
}
