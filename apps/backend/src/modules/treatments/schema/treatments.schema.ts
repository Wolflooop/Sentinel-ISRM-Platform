import { z } from "zod";

const ESTRATEGIA_MITIGAR_REQUIERE_CONTROL =
  "La estrategia MITIGAR requiere especificar al menos un control (controlIds no vacío)";

export const crearTratamientoSchema = z
  .object({
    riesgoId: z.string().uuid("riesgoId debe ser un identificador válido"),
    // Referencia histórica opcional (punto 5 del prompt: Tratamiento ya no
    // depende exclusivamente de Evaluacion).
    evaluacionOrigenId: z.string().uuid().nullable().optional(),
    // V2 (punto 6): N:M con Control — reemplaza controlPrincipalId único.
    controlIds: z.array(z.string().uuid()).default([]),
    controlPrincipalId: z.string().uuid().nullable().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]),
    descripcionPlan: z.string().min(1),
    usuarioResponsableId: z.string().uuid(),
    // V2 (punto 5): nuevos campos de gobernanza.
    fechaInicio: z.coerce.date().nullable().optional(),
    justificacion: z.string().trim().nullable().optional(),
    aprobadoPorId: z.string().uuid().nullable().optional(),
    fechaAprobacion: z.coerce.date().nullable().optional(),
    fechaLimite: z.coerce.date(),
    estado: z.enum(["PROPUESTO", "EN_EJECUCION", "COMPLETADO", "VENCIDO"]).optional(),
    porcentajeAvance: z.number().int().min(0).max(100).optional(),
    // Comentario del cambio de estado del riesgo (independiente de
    // descripcionPlan/justificacion).
    comentario: z.string().trim().min(1, "El comentario del cambio de estado es obligatorio"),
  })
  .refine((data) => data.estrategia !== "MITIGAR" || data.controlIds.length > 0, {
    message: ESTRATEGIA_MITIGAR_REQUIERE_CONTROL,
    path: ["controlIds"],
  })
  .refine(
    (data) => !data.controlPrincipalId || data.controlIds.includes(data.controlPrincipalId),
    {
      message: "controlPrincipalId debe estar incluido en controlIds",
      path: ["controlPrincipalId"],
    }
  );

export type CrearTratamientoInput = z.infer<typeof crearTratamientoSchema>;

export const actualizarTratamientoSchema = z
  .object({
    controlIds: z.array(z.string().uuid()).optional(),
    controlPrincipalId: z.string().uuid().nullable().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
    descripcionPlan: z.string().min(1).optional(),
    usuarioResponsableId: z.string().uuid().optional(),
    fechaInicio: z.coerce.date().nullable().optional(),
    justificacion: z.string().trim().nullable().optional(),
    aprobadoPorId: z.string().uuid().nullable().optional(),
    fechaAprobacion: z.coerce.date().nullable().optional(),
    fechaLimite: z.coerce.date().optional(),
    estado: z.enum(["PROPUESTO", "EN_EJECUCION", "COMPLETADO", "VENCIDO"]).optional(),
    porcentajeAvance: z.number().int().min(0).max(100).optional(),
    // Obligatorio solo si estado realmente cambia — lo decide
    // transicionarEstadoRiesgo, no este schema.
    comentario: z.string().trim().min(1).optional(),
  })
  .refine(
    (data) =>
      !data.controlPrincipalId ||
      !data.controlIds ||
      data.controlIds.includes(data.controlPrincipalId),
    {
      message: "controlPrincipalId debe estar incluido en controlIds",
      path: ["controlPrincipalId"],
    }
  );

export type ActualizarTratamientoInput = z.infer<typeof actualizarTratamientoSchema>;

export const filtrosTratamientosSchema = z.object({
  riesgoId: z.string().uuid().optional(),
  estado: z.enum(["PROPUESTO", "EN_EJECUCION", "COMPLETADO", "VENCIDO"]).optional(),
  estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
});

export type FiltrosTratamientosInput = z.infer<typeof filtrosTratamientosSchema>;
