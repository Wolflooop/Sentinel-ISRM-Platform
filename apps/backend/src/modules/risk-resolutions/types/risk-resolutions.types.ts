export type TipoResolucionRiesgo = "RESOLUCION" | "REAPERTURA";

export interface ResolucionRiesgoConRelaciones {
  id: string;
  riesgoId: string;
  tipo: TipoResolucionRiesgo;
  justificacion: string;
  usuarioId: string;
  fecha: Date;
  usuario: { id: string; nombre: string };
}

export interface CrearResolucionParams {
  riesgoId: string;
  tipo: TipoResolucionRiesgo;
  justificacion: string;
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export interface FiltrosResoluciones {
  riesgoId?: string;
  tipo?: TipoResolucionRiesgo;
}
