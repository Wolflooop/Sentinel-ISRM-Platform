import { z } from "zod";


export const crearRiesgoFormSchema = z.object({
  activoId: z.string().min(1, "Debes seleccionar un activo"),
  amenazaId: z.string().min(1, "Debes seleccionar una amenaza"),
  vulnerabilidadId: z.string().min(1, "Debes seleccionar una vulnerabilidad"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
});
export type CrearRiesgoFormValues = z.infer<typeof crearRiesgoFormSchema>;
