import { z } from "zod";

export const crearRiesgoAavSchema = z.object({
  origen: z.literal("AAV"),
  activoId: z.string().uuid("activoId debe ser un identificador válido"),
  amenazaId: z.string().uuid("amenazaId debe ser un identificador válido"),
  vulnerabilidadId: z.string().uuid("vulnerabilidadId debe ser un identificador válido"),
  probabilidad: z.number().int().min(1).max(5),
  impacto: z.number().int().min(1).max(5),
  responsableId: z.string().uuid("responsableId debe ser un identificador válido"),
});
export type CrearRiesgoAavInput = z.infer<typeof crearRiesgoAavSchema>;

export const crearRiesgoManualSchema = z.object({
  origen: z.literal("MANUAL"),
  titulo: z.string().trim().min(1, "El título es obligatorio"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria"),
  justificacionOrigen: z.string().trim().min(1, "La justificación de origen es obligatoria"),
  categoriaIdentificacionId: z.string().uuid("categoriaIdentificacionId debe ser un identificador válido"),
  probabilidad: z.number().int().min(1).max(5),
  impacto: z.number().int().min(1).max(5),
  responsableId: z.string().uuid("responsableId debe ser un identificador válido"),
});
export type CrearRiesgoManualInput = z.infer<typeof crearRiesgoManualSchema>;

// Discriminado por `origen` — el mismo endpoint POST /riesgos acepta ambos
// orígenes (punto 1 del prompt); el cuerpo determina cuál validar.
export const crearRiesgoSchema = z.discriminatedUnion("origen", [
  crearRiesgoAavSchema,
  crearRiesgoManualSchema,
]);
export type CrearRiesgoInput = z.infer<typeof crearRiesgoSchema>;

export const filtrosRiesgosSchema = z.object({
  estado: z
    .enum([
      "IDENTIFICADO",
      "EN_ANALISIS",
      "EVALUADO",
      "TRATADO",
      "CERRADO",
      "MONITOREADO",
      "ACEPTADO",
      "REABIERTO",
    ])
    .optional(),
  origen: z.enum(["AAV", "MANUAL"]).optional(),
  responsableId: z.string().uuid().optional(),
});
export type FiltrosRiesgosInput = z.infer<typeof filtrosRiesgosSchema>;

// Punto 13 del prompt: endpoint dedicado para asignar responsable —
// nunca a través de un PATCH genérico del riesgo.
export const asignarResponsableSchema = z.object({
  responsableId: z.string().uuid("responsableId debe ser un identificador válido"),
});
export type AsignarResponsableInput = z.infer<typeof asignarResponsableSchema>;
