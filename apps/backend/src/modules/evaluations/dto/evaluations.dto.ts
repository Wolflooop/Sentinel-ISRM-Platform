export interface EvaluacionResponseDTO {
  id: string;
  riesgoId: string;
  contextoId: string;
  tipoEvaluacion: string;
  probabilidad: number;
  impacto: number;
  valorCalculado: number;
  nivelRiesgo: string;
  resultado: string;
  justificacion: string;
  usuarioId: string;
  fechaEvaluacion: string;
  riesgo: {
    id: string;
    estado: string;
    origen: string;
    titulo: string | null;
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
