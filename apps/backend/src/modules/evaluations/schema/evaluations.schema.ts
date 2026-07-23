import { z } from "zod";

export const crearEvaluacionSchema = z.object({
  riesgoId: z.string().uuid("riesgoId debe ser un identificador válido"),
  contextoId: z.string().uuid("contextoId debe ser un identificador válido"),
  tipoEvaluacion: z.enum(["INHERENTE", "RESIDUAL"]),
  probabilidad: z.number().int().min(1).max(5),
  impacto: z.number().int().min(1).max(5),
  resultado: z.enum(["ACEPTABLE", "NO_ACEPTABLE"]),
  justificacion: z.string().trim().min(1, "La justificación es obligatoria"),
  // Independiente de `justificacion`: comentario que se registra en el
  // historial del riesgo. Crear una evaluación siempre transiciona
  // Riesgo.estado, así que es obligatorio.
  comentario: z.string().trim().min(1, "El comentario del cambio de estado es obligatorio"),
});

export type CrearEvaluacionInput = z.infer<typeof crearEvaluacionSchema>;

export const filtrosEvaluacionesSchema = z.object({
  riesgoId: z.string().uuid().optional(),
  tipoEvaluacion: z.enum(["INHERENTE", "RESIDUAL"]).optional(),
});

export type FiltrosEvaluacionesInput = z.infer<typeof filtrosEvaluacionesSchema>;
