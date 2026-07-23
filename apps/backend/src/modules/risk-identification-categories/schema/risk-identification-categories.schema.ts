import { z } from "zod";

export const crearCategoriaIdentificacionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
});
export type CrearCategoriaIdentificacionInput = z.infer<typeof crearCategoriaIdentificacionSchema>;

export const actualizarCategoriaIdentificacionSchema = z
  .object({
    nombre: z.string().trim().min(1).optional(),
    descripcion: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarCategoriaIdentificacionInput = z.infer<typeof actualizarCategoriaIdentificacionSchema>;
