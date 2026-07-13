/** DTO de salida para evaluaciones. */
export interface EvaluacionResponseDTO {
  id: string;
  riesgoId: string;
  contextoId: string;
  resultado: string;
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
