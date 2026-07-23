import { z } from "zod";

const MENSAJE_UN_DESTINO = "Debe indicar exactamente un destino: riesgoId, tratamientoId o controlId";

// Refleja el CHECK `seguimiento_exactamente_un_destino_check` (ver
// migración V2): exactamente un destino no nulo entre
// Riesgo/Tratamiento/Control (sin Evaluacion, a diferencia de Comentario).
export const crearSeguimientoSchema = z
  .object({
    riesgoId: z.string().uuid().nullable().optional(),
    tratamientoId: z.string().uuid().nullable().optional(),
    controlId: z.string().uuid().nullable().optional(),
    descripcion: z.string().trim().min(1, "La descripción del seguimiento es obligatoria"),
  })
  .refine(
    (data) => [data.riesgoId, data.tratamientoId, data.controlId].filter((v) => v !== undefined && v !== null).length === 1,
    { message: MENSAJE_UN_DESTINO, path: ["riesgoId"] }
  );

export type CrearSeguimientoInput = z.infer<typeof crearSeguimientoSchema>;

export const filtrosSeguimientosSchema = z
  .object({
    riesgoId: z.string().uuid().optional(),
    tratamientoId: z.string().uuid().optional(),
    controlId: z.string().uuid().optional(),
  })
  .refine((data) => [data.riesgoId, data.tratamientoId, data.controlId].filter(Boolean).length === 1, {
    message: MENSAJE_UN_DESTINO,
    path: ["riesgoId"],
  });

export type FiltrosSeguimientosInput = z.infer<typeof filtrosSeguimientosSchema>;
