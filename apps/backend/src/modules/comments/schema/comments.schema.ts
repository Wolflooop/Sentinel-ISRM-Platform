import { z } from "zod";

const MENSAJE_UN_DESTINO = "Debe indicar exactamente un destino: riesgoId, evaluacionId, tratamientoId o controlId";

// Refleja el CHECK `comentario_exactamente_un_destino_check` (ver migración
// V2): exactamente un destino no nulo entre Riesgo/Evaluacion/Tratamiento/Control.
export const crearComentarioSchema = z
  .object({
    riesgoId: z.string().uuid().nullable().optional(),
    evaluacionId: z.string().uuid().nullable().optional(),
    tratamientoId: z.string().uuid().nullable().optional(),
    controlId: z.string().uuid().nullable().optional(),
    contenido: z.string().trim().min(1, "El contenido del comentario es obligatorio"),
  })
  .refine(
    (data) =>
      [data.riesgoId, data.evaluacionId, data.tratamientoId, data.controlId].filter(
        (v) => v !== undefined && v !== null
      ).length === 1,
    { message: MENSAJE_UN_DESTINO, path: ["riesgoId"] }
  );

export type CrearComentarioInput = z.infer<typeof crearComentarioSchema>;

export const filtrosComentariosSchema = z
  .object({
    riesgoId: z.string().uuid().optional(),
    evaluacionId: z.string().uuid().optional(),
    tratamientoId: z.string().uuid().optional(),
    controlId: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      [data.riesgoId, data.evaluacionId, data.tratamientoId, data.controlId].filter(Boolean).length === 1,
    { message: MENSAJE_UN_DESTINO, path: ["riesgoId"] }
  );

export type FiltrosComentariosInput = z.infer<typeof filtrosComentariosSchema>;
