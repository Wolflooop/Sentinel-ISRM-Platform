export type EstadoRiesgo =
  | "IDENTIFICADO"
  | "EN_ANALISIS"
  | "EVALUADO"
  | "TRATADO"
  | "CERRADO"
  | "MONITOREADO"
  | "ACEPTADO"
  | "REABIERTO";

export type NivelRiesgo =
  | "BAJO"
  | "MEDIO"
  | "ALTO"
  | "CRITICO";

export type OrigenRiesgo =
  | "AAV"
  | "MANUAL";

export interface EvaluacionActualResumen {
  id: string;
  tipoEvaluacion: "INHERENTE" | "RESIDUAL";
  probabilidad: number;
  impacto: number;
  valorCalculado: number;
  nivelRiesgo: NivelRiesgo;
  fechaEvaluacion: Date;
}

export interface RiesgoConRelaciones {
  id: string;
  origen: OrigenRiesgo;

  aavId: string | null;

  titulo: string | null;
  descripcion: string | null;
  justificacionOrigen: string | null;

  estado: EstadoRiesgo;
  creadoEn: Date;

  creadorId: string;
  responsableId: string | null;

  evaluacionActualId: string | null;

  aav: {
    activo: {
      id: string;
      nombre: string;
    };
    amenaza: {
      id: string;
      nombre: string;
    };
    vulnerabilidad: {
      id: string;
      nombre: string;
    };
  } | null;

  categoriaIdentificacion: {
    id: string;
    nombre: string;
  } | null;

  creador: {
    id: string;
    nombre: string;
  };

  responsable: {
    id: string;
    nombre: string;
  } | null;

  evaluacionActual: EvaluacionActualResumen | null;
}

export interface FiltrosRiesgos {
  estado?: EstadoRiesgo;
  origen?: OrigenRiesgo;
  responsableId?: string;
}

export interface CrearRiesgoAavParams {
  organizacionId: string;

  activoId: string;
  amenazaId: string;
  vulnerabilidadId: string;

  probabilidad: number;
  impacto: number;

  nivelRiesgoInherente: NivelRiesgo;

  responsableId: string | null;

  actor: {
    usuarioId: string;
    direccionIp: string;
  };
}

export interface CrearRiesgoManualParams {
  organizacionId: string;

  titulo: string;
  descripcion: string;
  justificacionOrigen: string;

  categoriaIdentificacionId: string;

  probabilidad: number;
  impacto: number;

  nivelRiesgoInherente: NivelRiesgo;

  responsableId: string | null;

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
  organizacionId: string | null;
  nombre: string;
}

export interface ContextoActivoResumen {
  id: string;
  organizacionId: string;
}

export interface CeldaMatrizResumen {
  nivelResultante: NivelRiesgo;
}

export interface CategoriaIdentificacionResumen {
  id: string;
  nombre: string;
}

export interface UsuarioDeOrganizacionResumen {
  id: string;
  organizacionId: string | null;
}

export interface ReasignarResponsableParams {
  riesgoId: string;

  responsableIdNuevo: string | null;

  actor: {
    usuarioId: string;
    direccionIp: string;
  };
}