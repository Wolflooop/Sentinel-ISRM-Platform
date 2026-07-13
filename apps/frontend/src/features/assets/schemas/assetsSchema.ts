import { z } from "zod";

export const activoFormSchema = z.object({
  categoriaId: z.string().min(1, "Debe seleccionar una categoría"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  usuarioResponsableId: z.string().min(1, "Debe seleccionar un responsable"),
  ubicacion: z.string().trim().optional(),
  criticidad: z.coerce.number().int().min(1).max(5),
  valorEconomicoEstimado: z.number().nonnegative().optional(),
});
export type ActivoFormValues = z.infer<typeof activoFormSchema>;
