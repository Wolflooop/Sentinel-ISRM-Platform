export type EstrategiaTratamiento = "EVITAR" | "MITIGAR" | "TRANSFERIR" | "ACEPTAR";
export type EstadoTratamiento = "PLANIFICADO" | "EN_PROGRESO" | "IMPLEMENTADO" | "VENCIDO";

export interface Tratamiento {
  id: string;
  evaluacionId: string;
  controlPrincipalId: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaLimite: string;
  estado: EstadoTratamiento;
  porcentajeAvance: number;
  evaluacion: {
    id: string;
    resultado: string;
    justificacion: string;
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
  };
  controlPrincipal: {
    id: string;
    nombre: string;
    tipo: string;
    estadoImplementacion: string;
  } | null;
  usuarioResponsable: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface FiltrosTratamientos {
  evaluacionId?: string;
  estado?: EstadoTratamiento;
  estrategia?: EstrategiaTratamiento;
}

export interface CrearTratamientoInput {
  evaluacionId: string;
  controlPrincipalId?: string | null;
  estrategia: EstrategiaTratamiento;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaLimite: string;
  estado?: EstadoTratamiento;
  porcentajeAvance?: number;
}

export interface ActualizarTratamientoInput {
  controlPrincipalId?: string | null;
  estrategia?: EstrategiaTratamiento;
  descripcionPlan?: string;
  usuarioResponsableId?: string;
  fechaLimite?: string;
  estado?: EstadoTratamiento;
  porcentajeAvance?: number;
}
