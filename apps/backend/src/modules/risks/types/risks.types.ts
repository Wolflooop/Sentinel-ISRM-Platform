
export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO";

export type NivelRiesgo = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";

export interface RiesgoConRelaciones {
  id: string;
  probabilidad: number;
  impacto: number;
  valorRiesgo: number;
  nivelRiesgoInherente: NivelRiesgo;
  nivelRiesgoResidual: NivelRiesgo | null;
  fechaUltimoCalculo: Date;
  estado: EstadoRiesgo;
  creadoEn: Date;
  aav: {
    activo: { id: string; nombre: string };
    amenaza: { id: string; nombre: string };
    vulnerabilidad: { id: string; nombre: string };
  };
}

export interface FiltrosRiesgos {
  estado?: EstadoRiesgo;
  nivelRiesgoInherente?: NivelRiesgo;
}


export interface CrearRiesgoParams {
  organizacionId: string;
  activoId: string;
  amenazaId: string;
  vulnerabilidadId: string;
  probabilidad: number;
  impacto: number;
  nivelRiesgoInherente: NivelRiesgo;
  actor: {
    usuarioId: string;
    direccionIp: string;
  };
}

export interface ActivoResumen {
  id: string;
  organizacionId: string;
  nombre: string;
  estado: string;
}

export interface AmenazaResumen {
  id: string;
  organizacionId: string | null;
  nombre: string;
}

export interface VulnerabilidadResumen {
  id: string;
  nombre: string;
}

export interface ContextoActivoResumen {
  id: string;
  organizacionId: string;
}

export interface CeldaMatrizResumen {
  nivelResultante: NivelRiesgo;
}
