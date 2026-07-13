import { z } from "zod";

export const vulnerabilidadFormSchema = z.object({
  categoriaId: z.string().min(1, "Debe seleccionar una categoría"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  severidad: z
    .number({ invalid_type_error: "Selecciona una severidad" })
    .int()
    .min(1, "La severidad debe estar entre 1 y 5")
    .max(5, "La severidad debe estar entre 1 y 5"),
  referenciaCVE: z.string().trim().optional(),
});
export type VulnerabilidadFormValues = z.infer<typeof vulnerabilidadFormSchema>;
