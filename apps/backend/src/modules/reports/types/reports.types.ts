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

/**
 * Datos agregados de la organización que alimentan la generación del
 * reporte. Se ensamblan en el repository (única capa autorizada a tocar
 * Prisma) a partir de los módulos ya existentes (activos, riesgos,
 * controles, contexto), sin duplicar su lógica de negocio: son consultas
 * de solo lectura, no reimplementaciones de las reglas de esos módulos.
 */
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
