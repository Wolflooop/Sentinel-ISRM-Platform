import { z } from "zod";

export const crearRiesgoAavFormSchema = z.object({
  origen: z.literal("AAV"),
  activoId: z.string().min(1, "Debes seleccionar un activo"),
  amenazaId: z.string().min(1, "Debes seleccionar una amenaza"),
  vulnerabilidadId: z.string().min(1, "Debes seleccionar una vulnerabilidad"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
  responsableId: z.string().min(1, "Debes seleccionar un responsable"),
});
export type CrearRiesgoAavFormValues = z.infer<typeof crearRiesgoAavFormSchema>;

// V2 (punto 1 del prompt): riesgo de origen MANUAL, sin AAV.
export const crearRiesgoManualFormSchema = z.object({
  origen: z.literal("MANUAL"),
  titulo: z.string().min(1, "El título es obligatorio"),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  justificacionOrigen: z.string().min(1, "La justificación de origen es obligatoria"),
  categoriaIdentificacionId: z.string().min(1, "Debes seleccionar una categoría"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
  responsableId: z.string().min(1, "Debes seleccionar un responsable"),
});
export type CrearRiesgoManualFormValues = z.infer<typeof crearRiesgoManualFormSchema>;

export const crearRiesgoFormSchema = z.discriminatedUnion("origen", [
  crearRiesgoAavFormSchema,
  crearRiesgoManualFormSchema,
]);
export type CrearRiesgoFormValues = z.infer<typeof crearRiesgoFormSchema>;

export const asignarResponsableFormSchema = z.object({
  responsableId: z.string().min(1, "Debes seleccionar un responsable"),
});
export type AsignarResponsableFormValues = z.infer<typeof asignarResponsableFormSchema>;
