import { z } from "zod";

export const crearRolSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
});
export type CrearRolInput = z.infer<typeof crearRolSchema>;

// `esSistema` nunca es parte del payload de actualización: es un atributo de
// origen (definido al crear el catálogo base), no editable por API.
export const actualizarRolSchema = z
  .object({
    nombre: z.string().trim().min(1).optional(),
    descripcion: z.string().trim().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarRolInput = z.infer<typeof actualizarRolSchema>;

export const asignarPermisoSchema = z.object({
  permisoId: z.string().uuid("permisoId debe ser un identificador válido"),
});
export type AsignarPermisoInput = z.infer<typeof asignarPermisoSchema>;
