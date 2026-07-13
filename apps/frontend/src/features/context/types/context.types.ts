export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface Contexto {
  id: string;
  alcance: string;
  criteriosAceptacion: string;
  activo: boolean;
  creadoEn: string;
}

export interface EscalaItem {
  id: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface MatrizCelda {
  id: string;
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: NivelRiesgo;
}

export interface ContextoDetalle extends Contexto {
  escalasImpacto: EscalaItem[];
  escalasProbabilidad: EscalaItem[];
  matriz: MatrizCelda[];
}
