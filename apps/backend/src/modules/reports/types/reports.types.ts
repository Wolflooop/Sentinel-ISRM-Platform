import { TipoRol } from "@prisma/client";

export type TipoReporte = "EJECUTIVO" | "TECNICO" | "GENERAL";
export type FormatoReporte = "PDF" | "XLSX" | "CSV";

// Alcance del reporte: determina si recopilarDatosOrganizacion trae la
// organización completa (ADMIN_TIC) o solo lo vinculado al usuario actual
// (USUARIO_COMUN). Esta capa es exclusivamente de FILTRADO DE DATOS — no
// sustituye ni interactúa con RBAC/permisos/rutas, que ya decidieron antes
// de llegar aquí si el usuario puede generar el reporte.
export interface AlcanceReporte {
  tipoRol: TipoRol;
  usuarioId: string;
}

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
    amenaza: string | null;
    vulnerabilidad: string | null;
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
