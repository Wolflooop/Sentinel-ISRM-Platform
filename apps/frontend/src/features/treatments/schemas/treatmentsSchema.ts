import { z } from "zod";

// Corrección UX/negocio: la relación tratamiento → control es 1:1. Ya no
// existen "Controles asociados" (múltiple) ni "Control principal" como
// campos separados: un único selector "Control asociado".
export const treatmentFormSchema = z
  .object({
    controlAsociadoId: z.string().trim().optional(),
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
  .refine((valores) => valores.estrategia !== "MITIGAR" || !!valores.controlAsociadoId?.trim(), {
    message: "La estrategia MITIGAR requiere seleccionar un control asociado",
    path: ["controlAsociadoId"],
  });

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
