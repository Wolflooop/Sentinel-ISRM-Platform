export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

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
}

export interface IndicadoresDashboard {
  totalActivos: number;
  totalRiesgos: number;
  riesgosCriticos: number;
  totalControles: number;
}
