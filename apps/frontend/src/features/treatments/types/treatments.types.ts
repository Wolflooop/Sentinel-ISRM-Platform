export type EstrategiaTratamiento = "EVITAR" | "MITIGAR" | "TRANSFERIR" | "ACEPTAR";
export type EstadoTratamiento = "PROPUESTO" | "EN_EJECUCION" | "COMPLETADO" | "VENCIDO";

export interface ControlAsociado {
  id: string;
  nombre: string;
  tipo: string;
  estadoImplementacion: string;
  esPrincipal: boolean;
}

export interface Tratamiento {
  id: string;
  riesgoId: string;
  evaluacionOrigenId: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaInicio: string | null;
  justificacion: string | null;
  aprobadoPorId: string | null;
  fechaAprobacion: string | null;
  fechaLimite: string;
  estado: EstadoTratamiento;
  porcentajeAvance: number;
  riesgo: {
    id: string;
    estado: string;
    origen: string;
    titulo: string | null;
  };
  evaluacionOrigen: {
    id: string;
    resultado: string;
    justificacion: string;
    fechaEvaluacion: string;
  } | null;
  usuarioResponsable: {
    id: string;
    nombre: string;
    email: string;
  };
  aprobadoPor: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  controles: ControlAsociado[];
}

export interface FiltrosTratamientos {
  riesgoId?: string;
  estado?: EstadoTratamiento;
  estrategia?: EstrategiaTratamiento;
}

export interface CrearTratamientoInput {
  riesgoId: string;
  evaluacionOrigenId?: string | null;
  controlIds: string[];
  controlPrincipalId?: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaInicio?: string | null;
  justificacion?: string | null;
  aprobadoPorId?: string | null;
  fechaAprobacion?: string | null;
  fechaLimite: string;
  estado?: EstadoTratamiento;
  porcentajeAvance?: number;
  // Independiente de `descripcionPlan`/`justificacion`: comentario del
  // historial del riesgo. Crear un tratamiento siempre transiciona
  // Riesgo.estado.
  comentario: string;
}

export interface ActualizarTratamientoInput {
  controlIds?: string[];
  controlPrincipalId?: string | null;
  estrategia?: EstrategiaTratamiento;
  descripcionPlan?: string;
  usuarioResponsableId?: string;
  fechaInicio?: string | null;
  justificacion?: string | null;
  aprobadoPorId?: string | null;
  fechaAprobacion?: string | null;
  fechaLimite?: string;
  estado?: EstadoTratamiento;
  porcentajeAvance?: number;
  comentario?: string;
}
