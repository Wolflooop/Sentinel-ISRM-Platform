import { z } from "zod";

/**
 * `activoId`/`amenazaId`/`vulnerabilidadId` identifican la combinación sobre
 * la que se crea (o reutiliza) internamente el AAV — el cliente nunca
 * envía ni recibe un `aavId`; esa entidad no se expone (ver PASO 1).
 * `probabilidad`/`impacto`: enteros 1–5 (schema.prisma, no 0–100% como
 * sugiere "Pantallas descriptivas" — contradicción ya resuelta por
 * jerarquía documental desde la Constitución, Sección 3.3).
 */
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
