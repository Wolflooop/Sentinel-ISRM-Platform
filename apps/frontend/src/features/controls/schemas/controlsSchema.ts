import { z } from "zod";

export const controlFormSchema = z
  .object({
    codigoIso27001: z.string().trim().optional(),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    tipo: z.enum(["PREVENTIVO", "DETECTIVO", "CORRECTIVO"], {
      errorMap: () => ({ message: "Selecciona un tipo de control" }),
    }),
    estadoImplementacion: z.enum(["NO_INICIADO", "EN_PROGRESO", "IMPLEMENTADO", "VERIFICADO"]),
    fechaImplementacion: z.string().trim().optional(),
    descripcionImplementacion: z.string().trim().optional(),
    observaciones: z.string().trim().optional(),
    responsableId: z.string().trim().optional(),
  })
  .refine(
    (valores) =>
      !valores.fechaImplementacion ||
      valores.estadoImplementacion === "IMPLEMENTADO" ||
      valores.estadoImplementacion === "VERIFICADO",
    {
      message: "La fecha de implementación solo aplica cuando el estado es 'Implementado' o 'Verificado'",
      path: ["fechaImplementacion"],
    }
  );

export type ControlFormValues = z.infer<typeof controlFormSchema>;
