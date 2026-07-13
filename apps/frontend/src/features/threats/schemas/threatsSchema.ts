import { z } from "zod";

export const amenazaFormSchema = z.object({
  categoriaId: z.string().min(1, "Debe seleccionar una categoría"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  origen: z.enum(["INTERNO", "EXTERNO"], {
    errorMap: () => ({ message: "Selecciona un origen" }),
  }),
});
export type AmenazaFormValues = z.infer<typeof amenazaFormSchema>;
