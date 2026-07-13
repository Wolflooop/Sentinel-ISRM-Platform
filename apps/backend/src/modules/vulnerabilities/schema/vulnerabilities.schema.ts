import { z } from "zod";

/**
 * `severidad` (1-5): restricción de dominio que schema.prisma documenta
 * explícitamente como no aplicable vía CHECK nativo de Prisma (mismo
 * comentario que en `Activo.criticidad`) — se valida aquí en Zod.
 *
 * `referenciaCVE`: opcional, sin formato exigido por ningún documento — no
 * se inventa un patrón/regex de validación no especificado.
 *
 * A diferencia de threats.schema.ts, no existe `organizacionId` que excluir
 * del payload del cliente: `Vulnerabilidad` no tiene ese campo en
 * schema.prisma (catálogo 100% global, ver types/vulnerabilities.types.ts).
 */

export const crearVulnerabilidadSchema = z.object({
  categoriaId: z.string().uuid("categoriaId debe ser un identificador válido"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  severidad: z.number().int().min(1, "La severidad debe estar entre 1 y 5").max(5, "La severidad debe estar entre 1 y 5"),
  referenciaCVE: z.string().trim().optional(),
});
export type CrearVulnerabilidadInput = z.infer<typeof crearVulnerabilidadSchema>;

export const actualizarVulnerabilidadSchema = z
  .object({
    categoriaId: z.string().uuid().optional(),
    nombre: z.string().trim().min(1).optional(),
    descripcion: z.string().trim().optional(),
    severidad: z.number().int().min(1).max(5).optional(),
    referenciaCVE: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarVulnerabilidadInput = z.infer<typeof actualizarVulnerabilidadSchema>;

export const filtrosVulnerabilidadesSchema = z.object({
  categoriaId: z.string().uuid().optional(),
  severidad: z.coerce.number().int().min(1).max(5).optional(),
  busqueda: z.string().trim().min(1).optional(),
});
export type FiltrosVulnerabilidadesInput = z.infer<typeof filtrosVulnerabilidadesSchema>;
