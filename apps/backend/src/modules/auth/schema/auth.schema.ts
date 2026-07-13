import { z } from "zod";

/**
 * Decisión aprobada (Fase 2): el login identifica la organización mediante
 * Organizacion + Email + Password, usando únicamente campos existentes en
 * schema.prisma. Se envía el nombre de la organización tal como está
 * modelado (`Organizacion.nombre`, con restricción @unique), no un slug ni
 * un identificador nuevo.
 */
export const loginSchema = z.object({
  organizacion: z
    .string({ required_error: "La organización es obligatoria" })
    .trim()
    .min(1, "La organización es obligatoria"),
  email: z
    .string({ required_error: "El correo es obligatorio" })
    .trim()
    .email("El correo no tiene un formato válido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
