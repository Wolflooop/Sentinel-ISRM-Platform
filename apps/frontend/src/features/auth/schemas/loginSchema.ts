import { z } from "zod";

/**
 * Debe reflejar exactamente el contrato de entrada del backend
 * (apps/backend/src/modules/auth/schema/auth.schema.ts): Organización + Email
 * + Password, sin campos adicionales.
 */
export const loginFormSchema = z.object({
  organizacion: z.string().trim().min(1, "La organización es obligatoria"),
  email: z.string().trim().email("El correo no tiene un formato válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
