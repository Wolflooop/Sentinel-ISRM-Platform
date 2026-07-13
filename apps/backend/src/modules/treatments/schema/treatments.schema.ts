import { z } from "zod";

export const crearTratamientoSchema = z.object({
  evaluacionId: z.string().min(1),
  controlPrincipalId: z.string().min(1).nullable().optional(),
  estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]),
  descripcionPlan: z.string().min(1),
  usuarioResponsableId: z.string().min(1),
  fechaLimite: z.coerce.date(),
  estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
  porcentajeAvance: z.number().int().min(0).max(100).optional(),
});

export type CrearTratamientoInput = z.infer<typeof crearTratamientoSchema>;

export const actualizarTratamientoSchema = z.object({
  controlPrincipalId: z.string().min(1).nullable().optional(),
  estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
  descripcionPlan: z.string().min(1).optional(),
  usuarioResponsableId: z.string().min(1).optional(),
  fechaLimite: z.coerce.date().optional(),
  estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
  porcentajeAvance: z.number().int().min(0).max(100).optional(),
});

export type ActualizarTratamientoInput = z.infer<typeof actualizarTratamientoSchema>;

export const filtrosTratamientosSchema = z.object({
  evaluacionId: z.string().min(1).optional(),
  estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
  estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
});

export type FiltrosTratamientosInput = z.infer<typeof filtrosTratamientosSchema>;
