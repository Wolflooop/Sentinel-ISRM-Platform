/**
 * Tipos internos del módulo organizations, compartidos entre repository y
 * service. No son DTO de respuesta (ver dto/organizations.dto.ts) ni
 * esquemas de validación de entrada (ver schema/organizations.schema.ts).
 *
 * Refleja exactamente el modelo `Organizacion` de schema.prisma — ningún
 * campo agregado ni omitido. Los enums se redefinen como uniones de string
 * literal (no se importa `@prisma/client` aquí) para mantener Prisma
 * confinado exclusivamente a la capa de repository, igual que en
 * auth.types.ts / users.types.ts.
 */
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
