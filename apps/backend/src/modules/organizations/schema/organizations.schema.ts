import { z } from "zod";



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


export const cambiarEstadoOrganizacionSchema = z.object({
  estado: estadoOrganizacionEnum,
});
export type CambiarEstadoOrganizacionInput = z.infer<typeof cambiarEstadoOrganizacionSchema>;

// Solo el Administrador Principal (SUPER_ADMIN) puede crear organizaciones.
export const crearOrganizacionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  sector: sectorEnum,
  tamano: tamanoEnum,
  paisIso: z.string().trim().length(2, "paisIso debe ser un código ISO de 2 letras"),
  correoContacto: z.string().trim().email("Correo inválido").nullable().optional(),
  telefono: z.string().trim().nullable().optional(),
  direccion: z.string().trim().nullable().optional(),
});
export type CrearOrganizacionInput = z.infer<typeof crearOrganizacionSchema>;
