import { z } from "zod";

export const filtrosEventosSeguridadSchema = z.object({
  evento: z
    .enum([
      "AUTH_LOGIN_SUCCESS",
      "AUTH_LOGIN_FAILED",
      "AUTH_LOGOUT",
      "AUTH_SESSION_EXPIRED",
      "AUTH_ACCESS_DENIED",
    ])
    .optional(),
  resultado: z.enum(["EXITO", "FALLIDO"]).optional(),
  severidad: z.enum(["INFO", "ADVERTENCIA", "ALTA", "CRITICA"]).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type FiltrosEventosSeguridadInput = z.infer<typeof filtrosEventosSeguridadSchema>;
