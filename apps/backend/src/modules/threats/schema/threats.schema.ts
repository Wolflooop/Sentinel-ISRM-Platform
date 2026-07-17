import { z } from "zod";


export const crearAmenazaSchema = z.object({
  categoriaId: z.string().uuid("categoriaId debe ser un identificador válido"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  origen: z.enum(["INTERNO", "EXTERNO"]),
});
export type CrearAmenazaInput = z.infer<typeof crearAmenazaSchema>;

export const actualizarAmenazaSchema = z
  .object({
    categoriaId: z.string().uuid().optional(),
    nombre: z.string().trim().min(1).optional(),
    descripcion: z.string().trim().optional(),
    origen: z.enum(["INTERNO", "EXTERNO"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarAmenazaInput = z.infer<typeof actualizarAmenazaSchema>;

export const filtrosAmenazasSchema = z.object({
  categoriaId: z.string().uuid().optional(),
  origen: z.enum(["INTERNO", "EXTERNO"]).optional(),
  busqueda: z.string().trim().min(1).optional(),
});
export type FiltrosAmenazasInput = z.infer<typeof filtrosAmenazasSchema>;
