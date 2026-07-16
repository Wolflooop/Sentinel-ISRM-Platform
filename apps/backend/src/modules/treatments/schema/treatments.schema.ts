import { z } from "zod";

/**
 * Hallazgo #4 de auditoría: la estrategia MITIGAR requiere un control
 * principal (sin él, calcularNivelResidual no tiene información para
 * reducir probabilidad/impacto — ver comentario en treatments.repository.ts).
 * EVITAR/TRANSFERIR/ACEPTAR no dependen de ningún control, por lo que no
 * se exige aquí.
 */
const ESTRATEGIA_MITIGAR_REQUIERE_CONTROL =
  "La estrategia MITIGAR requiere especificar un controlPrincipalId";

export const crearTratamientoSchema = z
  .object({
    evaluacionId: z.string().min(1),
    controlPrincipalId: z.string().min(1).nullable().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]),
    descripcionPlan: z.string().min(1),
    usuarioResponsableId: z.string().min(1),
    fechaLimite: z.coerce.date(),
    estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
    porcentajeAvance: z.number().int().min(0).max(100).optional(),
  })
  .refine((data) => data.estrategia !== "MITIGAR" || !!data.controlPrincipalId, {
    message: ESTRATEGIA_MITIGAR_REQUIERE_CONTROL,
    path: ["controlPrincipalId"],
  });

export type CrearTratamientoInput = z.infer<typeof crearTratamientoSchema>;

/**
 * En actualización, controlPrincipalId/estrategia pueden venir parciales o
 * ausentes (se conserva el valor existente en BD), así que este refine solo
 * cubre el caso en que la MISMA petición fija estrategia=MITIGAR junto con
 * controlPrincipalId null explícito. El caso "ya era MITIGAR en BD y esta
 * petición solo quita el control" o "cambia a MITIGAR sin tocar
 * controlPrincipalId porque ya había uno" depende del estado previo en BD y
 * se valida en el Service (actualizarTratamientoExistente), no aquí.
 */
export const actualizarTratamientoSchema = z
  .object({
    controlPrincipalId: z.string().min(1).nullable().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
    descripcionPlan: z.string().min(1).optional(),
    usuarioResponsableId: z.string().min(1).optional(),
    fechaLimite: z.coerce.date().optional(),
    estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
    porcentajeAvance: z.number().int().min(0).max(100).optional(),
  })
  .refine((data) => data.estrategia !== "MITIGAR" || data.controlPrincipalId !== null, {
    message: ESTRATEGIA_MITIGAR_REQUIERE_CONTROL,
    path: ["controlPrincipalId"],
  });

export type ActualizarTratamientoInput = z.infer<typeof actualizarTratamientoSchema>;

export const filtrosTratamientosSchema = z.object({
  evaluacionId: z.string().min(1).optional(),
  estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]).optional(),
  estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"]).optional(),
});

export type FiltrosTratamientosInput = z.infer<typeof filtrosTratamientosSchema>;
