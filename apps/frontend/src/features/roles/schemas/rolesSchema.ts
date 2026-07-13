import { z } from "zod";

export const editarRolFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
});
export type EditarRolFormValues = z.infer<typeof editarRolFormSchema>;
