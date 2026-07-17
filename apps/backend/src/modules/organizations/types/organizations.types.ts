
export type Sector = "PUBLICO" | "PRIVADO";
export type TamanoOrganizacion = "MICRO" | "PEQUENA" | "MEDIANA" | "GRANDE";
export type EstadoOrganizacion = "ACTIVA" | "SUSPENDIDA" | "INACTIVA";
export type FormatoReporte = "PDF" | "XLSX" | "CSV";

export interface OrganizacionCompleta {
  id: string;
  nombre: string;
  sector: Sector;
  tamano: TamanoOrganizacion;
  paisIso: string;
  correoContacto: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: EstadoOrganizacion;
  diasAlertaTratamiento: number | null;
  formatoReportePredeterminado: FormatoReporte | null;
  creadoEn: Date;
}

export interface ActualizarOrganizacionParams {
  nombre?: string;
  sector?: Sector;
  tamano?: TamanoOrganizacion;
  paisIso?: string;
  correoContacto?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  diasAlertaTratamiento?: number | null;
  formatoReportePredeterminado?: FormatoReporte | null;
}
