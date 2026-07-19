import { z } from "zod";


export const actualizarOrganizacionFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  sector: z.enum(["PUBLICO", "PRIVADO"], {
    errorMap: () => ({ message: "Selecciona un sector" }),
  }),
  tamano: z.enum(["MICRO", "PEQUENA", "MEDIANA", "GRANDE"], {
    errorMap: () => ({ message: "Selecciona un tamaño" }),
  }),
  paisIso: z
    .string()
    .trim()
    .length(2, "Código ISO de 2 letras (ej. CO, MX, ES)")
    .toUpperCase(),
  correoContacto: z
    .string()
    .trim()
    .email("Correo inválido")
    .or(z.literal(""))
    .optional(),
  telefono: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
});
export type ActualizarOrganizacionFormValues = z.infer<
  typeof actualizarOrganizacionFormSchema
>;

// Solo la usa el Administrador Principal (SUPER_ADMIN) para crear una
// organización nueva en la plataforma.
export const crearOrganizacionFormSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  sector: z.enum(["PUBLICO", "PRIVADO"], {
    errorMap: () => ({ message: "Selecciona un sector" }),
  }),
  tamano: z.enum(["MICRO", "PEQUENA", "MEDIANA", "GRANDE"], {
    errorMap: () => ({ message: "Selecciona un tamaño" }),
  }),
  paisIso: z
    .string()
    .trim()
    .length(2, "Código ISO de 2 letras (ej. CO, MX, ES)")
    .toUpperCase(),
  correoContacto: z.string().trim().email("Correo inválido").or(z.literal("")).optional(),
  telefono: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
});
export type CrearOrganizacionFormValues = z.infer<typeof crearOrganizacionFormSchema>;
