import { z } from "zod";

export const crearContextoFormSchema = z.object({
  alcance: z.string().trim().min(1, "El alcance es obligatorio"),
  criteriosAceptacion: z.string().trim().min(1, "Los criterios de aceptación son obligatorios"),
});
export type CrearContextoFormValues = z.infer<typeof crearContextoFormSchema>;

export const editarContextoFormSchema = z.object({
  alcance: z.string().trim().min(1, "El alcance es obligatorio"),
  criteriosAceptacion: z.string().trim().min(1, "Los criterios de aceptación son obligatorios"),
});
export type EditarContextoFormValues = z.infer<typeof editarContextoFormSchema>;

const escalaItemFormSchema = z.object({
  nivel: z.number().int().min(1).max(5),
  etiqueta: z.string().trim().min(1, "La etiqueta es obligatoria"),
  descripcion: z.string().trim().optional(),
});

export const escalaFormSchema = z.object({
  niveles: z.array(escalaItemFormSchema).length(5),
});
export type EscalaFormValues = z.infer<typeof escalaFormSchema>;

const matrizCeldaFormSchema = z.object({
  nivelProbabilidad: z.number().int().min(1).max(5),
  nivelImpacto: z.number().int().min(1).max(5),
  nivelResultante: z.enum(["BAJO", "MEDIO", "ALTO", "CRITICO"]),
});

export const matrizFormSchema = z.object({
  celdas: z.array(matrizCeldaFormSchema).length(25),
});
export type MatrizFormValues = z.infer<typeof matrizFormSchema>;

// Tipo usado únicamente mientras el usuario está editando la matriz en el
// formulario. A diferencia de MatrizFormValues (que exige un NivelRiesgo
// válido en las 25 celdas, tal como lo requiere el backend), aquí
// `nivelResultante` admite "" para representar una celda que el usuario
// todavía no ha configurado. Nunca se envía "" al backend: el envío se
// valida contra matrizFormSchema antes de llamar a onSubmit.
export interface MatrizCeldaDraft {
  nivelProbabilidad: number;
  nivelImpacto: number;
  nivelResultante: MatrizFormValues["celdas"][number]["nivelResultante"] | "";
}
export interface MatrizFormDraftValues {
  celdas: MatrizCeldaDraft[];
}