import { z } from "zod";

export const crearEvaluacionFormSchema = z.object({
  riesgoId: z.string().min(1, "Debes indicar el riesgo"),
  contextoId: z.string().min(1, "Debes indicar el contexto"),
  resultado: z.enum(["ACEPTABLE", "NO_ACEPTABLE"]),
  justificacion: z.string().trim().min(1, "La justificación es obligatoria"),
});

export type CrearEvaluacionFormValues = z.infer<typeof crearEvaluacionFormSchema>;
