/** DTO de salida para tratamientos. */
export interface TratamientoResponseDTO {
  id: string;
  evaluacionId: string;
  controlPrincipalId: string | null;
  estrategia: string;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaLimite: string;
  estado: string;
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
