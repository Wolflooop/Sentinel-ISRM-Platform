export interface TratamientoResponseDTO {
  id: string;
  riesgoId: string;
  evaluacionOrigenId: string | null;
  estrategia: string;
  descripcionPlan: string;
  usuarioResponsableId: string;
  fechaInicio: string | null;
  justificacion: string | null;
  aprobadoPorId: string | null;
  fechaAprobacion: string | null;
  fechaLimite: string;
  estado: string;
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
  controles: Array<{
    id: string;
    nombre: string;
    tipo: string;
    estadoImplementacion: string;
    esPrincipal: boolean;
  }>;
}
