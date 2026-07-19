import { z } from "zod";

export const crearEvaluacionFormSchema = z.object({
  riesgoId: z.string().min(1, "Debes indicar el riesgo"),
  contextoId: z.string().min(1, "Debes indicar el contexto"),
  resultado: z.enum(["ACEPTABLE", "NO_ACEPTABLE"]),
  justificacion: z.string().trim().min(1, "La justificación es obligatoria"),
  // Independiente de `justificacion`: comentario del historial del riesgo.
  // Registrar una evaluación siempre cambia el estado del riesgo, así que
  // es obligatorio.
  comentario: z.string().trim().min(1, "El comentario del cambio de estado es obligatorio"),
});

export type CrearEvaluacionFormValues = z.infer<typeof crearEvaluacionFormSchema>;
