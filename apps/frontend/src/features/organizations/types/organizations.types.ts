
export interface Organizacion {
  id: string;
  nombre: string;
  sector: "PUBLICO" | "PRIVADO";
  tamano: "MICRO" | "PEQUENA" | "MEDIANA" | "GRANDE";
  paisIso: string;
  correoContacto: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: "ACTIVA" | "SUSPENDIDA" | "INACTIVA";
  diasAlertaTratamiento: number | null;
  formatoReportePredeterminado: "PDF" | "XLSX" | "CSV" | null;
  creadoEn: string;
}

export type EstadoOrganizacion = Organizacion["estado"];
