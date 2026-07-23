export type TipoResolucionRiesgo = "RESOLUCION" | "REAPERTURA";

export interface ResolucionRiesgo {
  id: string;
  riesgoId: string;
  tipo: TipoResolucionRiesgo;
  justificacion: string;
  fecha: string;
  usuario: { id: string; nombre: string };
}
