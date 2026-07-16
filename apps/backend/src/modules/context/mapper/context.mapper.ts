import {
  Contexto,
  ContextoConDetalle,
  EscalaImpacto,
  EscalaProbabilidad,
  MatrizCelda,
} from "../types/context.types";
import {
  ContextoResponseDTO,
  ContextoDetalleResponseDTO,
  EscalaItemResponseDTO,
  MatrizCeldaResponseDTO,
} from "../dto/context.dto";

export function toContextoResponseDTO(contexto: Contexto): ContextoResponseDTO {
  return {
    id: contexto.id,
    alcance: contexto.alcance,
    criteriosAceptacion: contexto.criteriosAceptacion,
    activo: contexto.activo,
    creadoEn: contexto.creadoEn.toISOString(),
  };
}

export function toContextoResponseListDTO(contextos: Contexto[]): ContextoResponseDTO[] {
  return contextos.map(toContextoResponseDTO);
}

function toEscalaItemResponseDTO(
  escala: EscalaImpacto | EscalaProbabilidad
): EscalaItemResponseDTO {
  return {
    id: escala.id,
    nivel: escala.nivel,
    etiqueta: escala.etiqueta,
    descripcion: escala.descripcion,
  };
}

function toMatrizCeldaResponseDTO(celda: MatrizCelda): MatrizCeldaResponseDTO {
  return {
    id: celda.id,
    nivelProbabilidad: celda.nivelProbabilidad,
    nivelImpacto: celda.nivelImpacto,
    nivelResultante: celda.nivelResultante,
  };
}

export function toContextoDetalleResponseDTO(
  contexto: ContextoConDetalle
): ContextoDetalleResponseDTO {
  return {
    ...toContextoResponseDTO(contexto),
    escalasImpacto: contexto.escalasImpacto
      .slice()
      .sort((a, b) => a.nivel - b.nivel)
      .map(toEscalaItemResponseDTO),
    escalasProbabilidad: contexto.escalasProbabilidad
      .slice()
      .sort((a, b) => a.nivel - b.nivel)
      .map(toEscalaItemResponseDTO),
    matriz: contexto.matricesRiesgo
      .slice()
      .sort((a, b) => a.nivelProbabilidad - b.nivelProbabilidad || a.nivelImpacto - b.nivelImpacto)
      .map(toMatrizCeldaResponseDTO),
  };
}
