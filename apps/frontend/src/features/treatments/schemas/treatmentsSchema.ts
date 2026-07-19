import { z } from "zod";

export const treatmentFormSchema = z
  .object({
    controlPrincipalId: z.string().trim().optional(),
    estrategia: z.enum(["EVITAR", "MITIGAR", "TRANSFERIR", "ACEPTAR"], {
      errorMap: () => ({ message: "Selecciona una estrategia" }),
    }),
    descripcionPlan: z.string().trim().min(1, "La descripción del plan es obligatoria"),
    usuarioResponsableId: z.string().min(1, "Selecciona un responsable"),
    fechaLimite: z.string().trim().min(1, "La fecha límite es obligatoria"),
    estado: z.enum(["PLANIFICADO", "EN_PROGRESO", "IMPLEMENTADO", "VENCIDO"]),
    porcentajeAvance: z.coerce.number().int().min(0).max(100),
    // Independiente de `descripcionPlan`. Obligatorio en creación (siempre
    // transiciona Riesgo.estado) y en edición solo si el estado cambia
    // respecto al valor actual — esa lógica vive en TreatmentForm.tsx, que
    // es quien sabe si estamos creando o editando.
    comentario: z.string().trim().optional(),
  })
  .refine((valores) => valores.estrategia !== "MITIGAR" || !!valores.controlPrincipalId, {
    message: "La estrategia MITIGAR requiere seleccionar un control principal",
    path: ["controlPrincipalId"],
  });

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;
