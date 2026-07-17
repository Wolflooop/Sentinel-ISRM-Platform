import { z } from "zod";


export const crearRiesgoSchema = z.object({
  activoId: z.string().uuid("activoId debe ser un identificador válido"),
  amenazaId: z.string().uuid("amenazaId debe ser un identificador válido"),
  vulnerabilidadId: z.string().uuid("vulnerabilidadId debe ser un identificador válido"),
  probabilidad: z.number().int().min(1).max(5),
  impacto: z.number().int().min(1).max(5),
});
export type CrearRiesgoInput = z.infer<typeof crearRiesgoSchema>;

export const filtrosRiesgosSchema = z.object({
  estado: z
    .enum(["IDENTIFICADO", "EN_ANALISIS", "EVALUADO", "TRATADO", "CERRADO", "MONITOREADO", "ACEPTADO"])
    .optional(),
  nivelRiesgoInherente: z.enum(["BAJO", "MEDIO", "ALTO", "CRITICO"]).optional(),
});
export type FiltrosRiesgosInput = z.infer<typeof filtrosRiesgosSchema>;
