import { z } from "zod";

// V2 (punto 6 del prompt): N:M con Control — reemplaza controlPrincipalId
// único. controlPrincipalId, si se indica, debe estar dentro de controlIds.
export const treatmentFormSchema = z
  .object({
    controlIds: z.array(z.string()).default([]),
    controlPrincipalId: z.string().trim().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"], {
      errorMap: () => ({ message: "Selecciona una estrategia" }),
    }),
    descripcionPlan: z.string().trim().min(1, "La descripción del plan es obligatoria"),
    usuarioResponsableId: z.string().min(1, "Selecciona un responsable"),
    fechaInicio: z.string().trim().optional(),
    justificacion: z.string().trim().optional(),
    aprobadoPorId: z.string().trim().optional(),
    fechaLimite: z.string().trim().min(1, "La fecha límite es obligatoria"),
    estado: z.enum(["PROPUESTO", "EN_EJECUCION", "COMPLETADO", "VENCIDO"]),
    porcentajeAvance: z.coerce.number().int().min(0).max(100),
    // Independiente de `descripcionPlan`/`justificacion`. Obligatorio en
    // creación (siempre transiciona Riesgo.estado) y en edición solo si el
    // estado cambia respecto al valor actual — esa lógica vive en
    // TreatmentForm.tsx, que es quien sabe si estamos creando o editando.
    comentario: z.string().trim().optional(),
  })
  .refine((valores) => valores.estrategia !== "MITIGAR" || valores.controlIds.length > 0, {
    message: "La estrategia MITIGAR requiere seleccionar al menos un control",
    path: ["controlIds"],
  })
  .refine(
    (valores) => !valores.controlPrincipalId || valores.controlIds.includes(valores.controlPrincipalId),
    { message: "El control principal debe estar entre los controles seleccionados", path: ["controlPrincipalId"] }
  );

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
