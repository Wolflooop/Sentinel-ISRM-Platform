import { z } from "zod";

export const crearResolucionSchema = z.object({
  riesgoId: z.string().uuid("riesgoId debe ser un identificador válido"),
  tipo: z.enum(["RESOLUCION", "REAPERTURA"]),
  justificacion: z.string().trim().min(1, "La justificación es obligatoria"),
});
export type CrearResolucionInput = z.infer<typeof crearResolucionSchema>;

export const filtrosResolucionesSchema = z.object({
  riesgoId: z.string().uuid().optional(),
  tipo: z.enum(["RESOLUCION", "REAPERTURA"]).optional(),
});
export type FiltrosResolucionesInput = z.infer<typeof filtrosResolucionesSchema>;
