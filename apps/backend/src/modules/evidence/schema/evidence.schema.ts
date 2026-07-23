import { z } from "zod";

const MENSAJE_UN_DESTINO = "Debe indicar exactamente un destino: riesgoId, tratamientoId o controlId";

// Refleja el CHECK `evidencia_exactamente_un_destino_check` (ver migración
// V2). El archivo en sí llega vía multipart/form-data (campo "archivo",
// ver middleware/uploadEvidencia.ts) y no forma parte de este schema Zod.
export const crearEvidenciaSchema = z
  .object({
    riesgoId: z.string().uuid().nullable().optional(),
    tratamientoId: z.string().uuid().nullable().optional(),
    controlId: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => [data.riesgoId, data.tratamientoId, data.controlId].filter((v) => v !== undefined && v !== null).length === 1,
    { message: MENSAJE_UN_DESTINO, path: ["riesgoId"] }
  );

export type CrearEvidenciaInput = z.infer<typeof crearEvidenciaSchema>;

export const validarEvidenciaSchema = z.object({
  estado: z.enum(["VALIDADA", "RECHAZADA"]),
  comentarioValidacion: z.string().trim().min(1).nullable().optional(),
});

export type ValidarEvidenciaInput = z.infer<typeof validarEvidenciaSchema>;

export const filtrosEvidenciasSchema = z
  .object({
    riesgoId: z.string().uuid().optional(),
    tratamientoId: z.string().uuid().optional(),
    controlId: z.string().uuid().optional(),
    estado: z.enum(["SUBIDA", "VALIDADA", "RECHAZADA"]).optional(),
  })
  .refine((data) => [data.riesgoId, data.tratamientoId, data.controlId].filter(Boolean).length === 1, {
    message: MENSAJE_UN_DESTINO,
    path: ["riesgoId"],
  });

export type FiltrosEvidenciasInput = z.infer<typeof filtrosEvidenciasSchema>;
