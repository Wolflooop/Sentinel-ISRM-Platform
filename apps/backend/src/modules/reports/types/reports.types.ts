export type TipoReporte = "EJECUTIVO" | "TECNICO" | "GENERAL";
export type FormatoReporte = "PDF" | "XLSX" | "CSV";

export interface ReporteConRelaciones {
  id: string;
  organizacionId: string;
  usuarioId: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  rutaArchivo: string;
  fecha: Date;
  usuario: {
    id: string;
    nombre: string;
  };
}

export interface CrearReporteParams {
  organizacionId: string;
  usuarioId: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  rutaArchivo: string;
}

export interface FiltrosReportes {
  organizacionId: string;
  tipo?: TipoReporte;
}


export interface DatosReporteOrganizacion {
  organizacion: {
    nombre: string;
    sector: string;
    tamano: string;
    paisIso: string;
  };
  activos: Array<{
    nombre: string;
    categoria: string;
    criticidad: number;
    estado: string;
  }>;
  riesgos: Array<{
    activo: string;
    amenaza: string;
    vulnerabilidad: string;
    probabilidad: number;
    impacto: number;
    valorRiesgo: number;
    nivelInherente: string;
    nivelResidual: string | null;
  }>;
  controles: Array<{
    nombre: string;
    tipo: string;
    estadoImplementacion: string;
    codigoIso27001: string | null;
  }>;
  matriz: {
    celdas: Array<{ probabilidad: number; impacto: number; nivel: string }>;
  } | null;
  generadoEn: Date;
}
