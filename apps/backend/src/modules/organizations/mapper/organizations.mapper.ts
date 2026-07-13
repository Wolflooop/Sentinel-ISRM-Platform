import { OrganizacionCompleta } from "../types/organizations.types";
import { OrganizacionResponseDTO } from "../dto/organizations.dto";

/**
 * Prisma Model → Mapper → DTO. Único punto autorizado para construir la
 * respuesta de organización a partir del modelo Prisma.
 */
export function toOrganizacionResponseDTO(
  organizacion: OrganizacionCompleta
): OrganizacionResponseDTO {
  return {
    id: organizacion.id,
    nombre: organizacion.nombre,
    sector: organizacion.sector,
    tamano: organizacion.tamano,
    paisIso: organizacion.paisIso,
    correoContacto: organizacion.correoContacto,
    telefono: organizacion.telefono,
    direccion: organizacion.direccion,
    estado: organizacion.estado,
    diasAlertaTratamiento: organizacion.diasAlertaTratamiento,
    formatoReportePredeterminado: organizacion.formatoReportePredeterminado,
    creadoEn: organizacion.creadoEn.toISOString(),
  };
}
