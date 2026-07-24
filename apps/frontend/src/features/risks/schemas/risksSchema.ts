import { z } from "zod";

// Fase 3a (creación de riesgos): responsableId se elimina del formulario de
// creación. El backend fija creadorId = responsableId = usuario autenticado
// automáticamente; la reasignación posterior sigue viviendo únicamente en
// AssignResponsibleForm (detalle del riesgo).
export const crearRiesgoAavFormSchema = z.object({
  origen: z.literal("AAV"),
  activoId: z.string().min(1, "Debes seleccionar un activo"),
  amenazaId: z.string().min(1, "Debes seleccionar una amenaza"),
  vulnerabilidadId: z.string().min(1, "Debes seleccionar una vulnerabilidad"),
  descripcion: z.string().min(1, "La descripción del riesgo es obligatoria"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
});
export type CrearRiesgoAavFormValues = z.infer<typeof crearRiesgoAavFormSchema>;

// V2 (punto 1 del prompt): riesgo de origen MANUAL, sin AAV.
export const crearRiesgoManualFormSchema = z.object({
  origen: z.literal("MANUAL"),
  titulo: z.string().min(1, "El título es obligatorio"),
  descripcion: z.string().min(1, "La descripción del riesgo es obligatoria"),
  justificacionOrigen: z.string().min(1, "La justificación de origen es obligatoria"),
  categoriaIdentificacionId: z.string().min(1, "Debes seleccionar una categoría"),
  probabilidad: z.coerce.number().int().min(1).max(5),
  impacto: z.coerce.number().int().min(1).max(5),
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
