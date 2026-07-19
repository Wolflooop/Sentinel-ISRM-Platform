import { z } from "zod";


export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es obligatorio" })
    .trim()
    .email("El correo no tiene un formato válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
