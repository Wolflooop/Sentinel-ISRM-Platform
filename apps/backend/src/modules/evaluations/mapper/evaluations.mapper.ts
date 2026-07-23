import { EvaluacionConRelaciones } from "../types/evaluations.types";
import { EvaluacionResponseDTO } from "../dto/evaluations.dto";

export function toEvaluacionResponseDTO(evaluacion: EvaluacionConRelaciones): EvaluacionResponseDTO {
  return {
    id: evaluacion.id,
    riesgoId: evaluacion.riesgoId,
    contextoId: evaluacion.contextoId,
    tipoEvaluacion: evaluacion.tipoEvaluacion,
    probabilidad: evaluacion.probabilidad,
    impacto: evaluacion.impacto,
    valorCalculado: evaluacion.valorCalculado,
    nivelRiesgo: evaluacion.nivelRiesgo,
    resultado: evaluacion.resultado,
    justificacion: evaluacion.justificacion,
    usuarioId: evaluacion.usuarioId,
    fechaEvaluacion: evaluacion.fechaEvaluacion.toISOString(),
    riesgo: {
      id: evaluacion.riesgo.id,
      estado: evaluacion.riesgo.estado,
      origen: evaluacion.riesgo.origen,
      titulo: evaluacion.riesgo.titulo,
    },
    contexto: {
      id: evaluacion.contexto.id,
      alcance: evaluacion.contexto.alcance,
      activo: evaluacion.contexto.activo,
    },
    usuario: {
      id: evaluacion.usuario.id,
      nombre: evaluacion.usuario.nombre,
      email: evaluacion.usuario.email,
    },
  };
}

export function toEvaluacionResponseListDTO(evaluaciones: EvaluacionConRelaciones[]): EvaluacionResponseDTO[] {
  return evaluaciones.map(toEvaluacionResponseDTO);
}
