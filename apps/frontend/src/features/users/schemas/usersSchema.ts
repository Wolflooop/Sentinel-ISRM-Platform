import { z } from "zod";


export const crearUsuarioFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().trim().email("El correo no tiene un formato válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rolId: z.string().min(1, "Debe seleccionar un rol"),
});
export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioFormSchema>;

export const editarUsuarioFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.string().trim().email("El correo no tiene un formato válido"),
  rolId: z.string().min(1, "Debe seleccionar un rol"),
});
export type EditarUsuarioFormValues = z.infer<typeof editarUsuarioFormSchema>;
