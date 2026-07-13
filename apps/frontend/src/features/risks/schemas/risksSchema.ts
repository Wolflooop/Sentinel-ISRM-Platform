import { z } from "zod";

/**
 * El usuario selecciona activo + amenaza + vulnerabilidad y define
 * probabilidad/impacto (enteros 1–5, schema.prisma) — nunca ve ni administra
 * el AAV subyacente, que se resuelve internamente en el backend.
 */
export const crearRiesgoFormSchema = z.object({
  activoId: z.string().min(1, "Debes seleccionar un activo"),
  amenazaId: z.string().min(1, "Debes seleccionar una amenaza"),
  vulnerabilidadId: z.string().min(1, "Debes seleccionar una vulnerabilidad"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
});
export type CrearRiesgoFormValues = z.infer<typeof crearRiesgoFormSchema>;
