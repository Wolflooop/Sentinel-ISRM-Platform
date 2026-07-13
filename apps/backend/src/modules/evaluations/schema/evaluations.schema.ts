import { z } from "zod";

export const crearEvaluacionSchema = z.object({
  riesgoId: z.string().uuid("riesgoId debe ser un identificador válido"),
  contextoId: z.string().uuid("contextoId debe ser un identificador válido"),
  resultado: z.enum(["ACEPTABLE", "NO_ACEPTABLE"]),
  justificacion: z.string().trim().min(1, "La justificación es obligatoria"),
});

export type CrearEvaluacionInput = z.infer<typeof crearEvaluacionSchema>;

export const filtrosEvaluacionesSchema = z.object({
  riesgoId: z.string().uuid().optional(),
});

export type FiltrosEvaluacionesInput = z.infer<typeof filtrosEvaluacionesSchema>;
