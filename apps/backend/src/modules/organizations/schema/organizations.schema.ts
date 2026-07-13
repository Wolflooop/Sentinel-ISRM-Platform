import { z } from "zod";

/**
 * `organizacionId` nunca se acepta desde el cliente en ningún esquema de este
 * módulo — siempre se resuelve desde `req.user.organizacionId` (JWT), igual
 * que en `users`/`roles`. No existen rutas con `:id` — la única organización
 * accesible es siempre la propia (Constitución, Sección 9: "Nunca permitir
 * acceso entre organizaciones").
 */

const sectorEnum = z.enum(["PUBLICO", "PRIVADO"]);
const tamanoEnum = z.enum(["MICRO", "PEQUENA", "MEDIANA", "GRANDE"]);
const formatoReporteEnum = z.enum(["PDF", "XLSX", "CSV"]);
const estadoOrganizacionEnum = z.enum(["ACTIVA", "SUSPENDIDA", "INACTIVA"]);

export const actualizarOrganizacionSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").optional(),
    sector: sectorEnum.optional(),
    tamano: tamanoEnum.optional(),
    paisIso: z
      .string()
      .trim()
      .length(2, "paisIso debe ser un código ISO de 2 letras")
      .optional(),
    correoContacto: z.string().trim().email("Correo inválido").nullable().optional(),
    telefono: z.string().trim().nullable().optional(),
    direccion: z.string().trim().nullable().optional(),
    diasAlertaTratamiento: z.number().int().positive().nullable().optional(),
    formatoReportePredeterminado: formatoReporteEnum.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarOrganizacionInput = z.infer<typeof actualizarOrganizacionSchema>;

/**
 * Cambio de estado — regla de negocio de la Fase 5 (Reglas de Integridad):
 * mover a SUSPENDIDA o INACTIVA revoca todas las sesiones activas de la
 * organización (aplicado en el service, no aquí).
 */
export const cambiarEstadoOrganizacionSchema = z.object({
  estado: estadoOrganizacionEnum,
});
export type CambiarEstadoOrganizacionInput = z.infer<typeof cambiarEstadoOrganizacionSchema>;
