export type TipoReporte = "EJECUTIVO" | "TECNICO" | "GENERAL";
export type FormatoReporte = "PDF" | "XLSX" | "CSV";

export interface Reporte {
  id: string;
  organizacionId: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  fecha: string;
  usuario: {
    id: string;
    nombre: string;
  };
}

export interface FiltrosReportes {
  tipo?: TipoReporte;
}

export interface GenerarReporteInput {
  tipo: TipoReporte;
  formato: FormatoReporte;
}
