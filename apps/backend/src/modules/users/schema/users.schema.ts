import { z } from "zod";



export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().trim().email("El correo no tiene un formato válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rolId: z.string().uuid("rolId debe ser un identificador válido"),
  // Solo tiene efecto cuando quien crea es un ADMIN_PRINCIPAL (SUPER_ADMIN):
  // es el único que puede elegir la organización. Si el actor es
  // ADMIN_TIC, este campo se ignora por completo en el servicio — la
  // organización se toma siempre de su propio token (req.user.organizacionId),
  // nunca de este valor enviado por el cliente.
  organizacionId: z.string().uuid("organizacionId debe ser un identificador válido").optional(),
});
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;

export const actualizarUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(1).optional(),
    email: z.string().trim().email("El correo no tiene un formato válido").optional(),
    rolId: z.string().uuid("rolId debe ser un identificador válido").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;

export const cambiarEstadoUsuarioSchema = z.object({
  activo: z.boolean(),
});
export type CambiarEstadoUsuarioInput = z.infer<typeof cambiarEstadoUsuarioSchema>;
