export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
export type EstadoImplementacionControl = "NO_INICIADO" | "EN_PROGRESO" | "IMPLEMENTADO" | "VERIFICADO";

export interface ActivoResumen {
  id: string;
}

// V2: el nivel de riesgo ya no vive como campos planos en Riesgo — vive en
// la Evaluacion vigente (evaluacionActual), que puede ser INHERENTE o
// RESIDUAL según cuál se haya registrado más recientemente.
export interface RiesgoResumen {
  id: string;
  evaluacionActual: {
    nivelRiesgo: NivelRiesgo;
  } | null;
}

export interface ControlResumen {
  id: string;
  estadoImplementacion: EstadoImplementacionControl;
}

export type ConteoPorNivel = Record<NivelRiesgo, number>;
export type ConteoPorEstadoControl = Record<EstadoImplementacionControl, number>;

export interface IndicadoresDashboard {
  totalActivos: number;
  totalRiesgos: number;
  riesgosCriticos: number;
  totalControles: number;
  riesgosPorNivel: ConteoPorNivel;
  controlesPorEstado: ConteoPorEstadoControl;
}
