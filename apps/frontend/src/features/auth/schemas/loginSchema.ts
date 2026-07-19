import { z } from "zod";


export const loginFormSchema = z.object({
  email: z.string().trim().email("El correo no tiene un formato válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
