import { z } from "zod";

/**
 * `organizacionId` nunca se acepta desde el cliente — siempre se resuelve
 * desde `req.user.organizacionId` (JWT), igual que en el resto de módulos.
 * `esPredefinida` tampoco se acepta desde el cliente: toda amenaza creada
 * por una organización nace con `esPredefinida = false` (solo el catálogo
 * global, fuera de alcance de este módulo, puede tener `true`).
 * `origen` es obligatorio porque schema.prisma lo define como NOT NULL,
 * aunque "Pantallas descriptivas" no lo mencione explícitamente.
 */

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
