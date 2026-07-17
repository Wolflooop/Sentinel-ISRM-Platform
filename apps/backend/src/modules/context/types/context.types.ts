
export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface Contexto {
  id: string;
  organizacionId: string;
  alcance: string;
  criteriosAceptacion: string;
  activo: boolean;
  creadoEn: Date;
}

export interface EscalaImpacto {
  id: string;
  contextoId: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface EscalaProbabilidad {
  id: string;
  contextoId: string;
  nivel: number;
  etiqueta: string;
  descripcion: string | null;
}

export interface MatrizCelda {
  id: string;
  contextoId: string;
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: NivelRiesgo;
}

export type ContextoConDetalle = Contexto & {
  escalasImpacto: EscalaImpacto[];
  escalasProbabilidad: EscalaProbabilidad[];
  matricesRiesgo: MatrizCelda[];
};

export interface CrearContextoParams {
  organizacionId: string;
  alcance: string;
  criteriosAceptacion: string;
}

export interface ActualizarContextoParams {
  alcance?: string;
  criteriosAceptacion?: string;
}

export interface EscalaItemParams {
  nivel: number;
  etiqueta: string;
  descripcion?: string;
}

export interface MatrizCeldaParams {
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: NivelRiesgo;
}

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  organizacionId: string;
  entidad: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  direccionIp: string;
}
