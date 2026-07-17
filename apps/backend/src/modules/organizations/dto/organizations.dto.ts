
export interface OrganizacionResponseDTO {
  id: string;
  nombre: string;
  sector: string;
  tamano: string;
  paisIso: string;
  correoContacto: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  diasAlertaTratamiento: number | null;
  formatoReportePredeterminado: string | null;
  creadoEn: string;
}
