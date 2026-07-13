export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
export type EstadoImplementacionControl = "NO_APLICADO" | "PLANIFICADO" | "EN_PROGRESO" | "IMPLEMENTADO";

/**
 * Subconjuntos mínimos de cada recurso — el dashboard solo necesita contar
 * y clasificar, no el DTO completo de cada módulo. Evita acoplar este
 * feature a los tipos internos de activos/riesgos/controles.
 */
export interface ActivoResumen {
  id: string;
}

export interface RiesgoResumen {
  id: string;
  nivelRiesgoInherente: NivelRiesgo;
  nivelRiesgoResidual: NivelRiesgo | null;
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
