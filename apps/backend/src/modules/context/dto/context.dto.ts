export interface ContextoResponseDTO {
  id: string;
  alcance: string;
  criteriosAceptacion: string;
  activo: boolean;
  creadoEn: string;
}

export interface EscalaItemResponseDTO {
  id: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface MatrizCeldaResponseDTO {
  id: string;
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: string;
}

export interface ContextoDetalleResponseDTO extends ContextoResponseDTO {
  escalasImpacto: EscalaItemResponseDTO[];
  escalasProbabilidad: EscalaItemResponseDTO[];
  matriz: MatrizCeldaResponseDTO[];
}
