import { z } from "zod";

export const crearControlSchema = z.object({
  codigoIso27001: z.string().min(1).nullable().optional(),
  nombre: z.string().min(1),
  tipo: z.enum(["PREVENTIVO", "DETECTIVO", "CORRECTIVO"]),
  estadoImplementacion: z.enum(["NO_APLICADO", "PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO"]).optional(),
  fechaImplementacion: z.coerce.date().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  descripcionImplementacion: z.string().nullable().optional(),
});

export type CrearControlInput = z.infer<typeof crearControlSchema>;

export const actualizarControlSchema = z.object({
  codigoIso27001: z.string().min(1).nullable().optional(),
  nombre: z.string().min(1).optional(),
  tipo: z.enum(["PREVENTIVO", "DETECTIVO", "CORRECTIVO"]).optional(),
  estadoImplementacion: z.enum(["NO_APLICADO", "PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO"]).optional(),
  fechaImplementacion: z.coerce.date().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  descripcionImplementacion: z.string().nullable().optional(),
});

export type ActualizarControlInput = z.infer<typeof actualizarControlSchema>;

export const filtrosControlesSchema = z.object({
  tipo: z.enum(["PREVENTIVO", "DETECTIVO", "CORRECTIVO"]).optional(),
  estadoImplementacion: z.enum(["NO_APLICADO", "PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO"]).optional(),
});

export type FiltrosControlesInput = z.infer<typeof filtrosControlesSchema>;
