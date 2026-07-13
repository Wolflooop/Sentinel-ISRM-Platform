/**
 * Forma exacta de la respuesta HTTP. No expone ningún campo interno que no
 * exista ya en `Organizacion` (schema.prisma) — no hay datos sensibles en
 * este modelo, pero se mantiene el patrón Mapper/DTO por consistencia
 * arquitectónica con el resto del backend.
 */
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
