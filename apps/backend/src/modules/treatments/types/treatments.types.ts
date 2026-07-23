export type EstrategiaTratamiento = "EVITAR" | "MITIGAR" | "TRANSFERIR" | "ACEPTAR";
export type EstadoTratamiento = "PROPUESTO" | "EN_EJECUCION" | "COMPLETADO" | "VENCIDO";

export interface ControlAsociadoResumen {
  id: string;
  nombre: string;
  tipo: string;
  estadoImplementacion: string;
  esPrincipal: boolean;
}

export interface TratamientoConRelaciones {
  id: string;
  riesgoId: string;
  evaluacionOrigenId: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaInicio: Date | null;
  justificacion: string | null;
  aprobadoPorId: string | null;
  fechaAprobacion: Date | null;
  fechaLimite: Date;
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
    fechaEvaluacion: Date;
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
  controles: ControlAsociadoResumen[];
}

export interface CrearTratamientoParams {
  riesgoId: string;
  evaluacionOrigenId: string | null;
  controlIds: string[];
  controlPrincipalId: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaInicio: Date | null;
  justificacion: string | null;
  aprobadoPorId: string | null;
  fechaAprobacion: Date | null;
  fechaLimite: Date;
  estado: EstadoTratamiento;
  porcentajeAvance: number;
}

export interface ActualizarTratamientoParams {
  controlIds?: string[];
  controlPrincipalId?: string | null;
  estrategia?: EstrategiaTratamiento;
  descripcionPlan?: string;
  usuarioResponsableId?: string;
  fechaInicio?: Date | null;
  justificacion?: string | null;
  aprobadoPorId?: string | null;
  fechaAprobacion?: Date | null;
  fechaLimite?: Date;
  estado?: EstadoTratamiento;
  porcentajeAvance?: number;
}

export interface FiltrosTratamientos {
  riesgoId?: string;
  estado?: EstadoTratamiento;
  estrategia?: EstrategiaTratamiento;
}
