import { z } from "zod";

export const filtrosAuditoriaSchema = z.object({
  entidad: z.string().min(1).optional(),
  entidadId: z.string().min(1).optional(),
  accion: z.enum(["CREAR", "EDITAR", "ELIMINAR", "APROBAR"]).optional(),
  usuarioId: z.string().min(1).optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});

export type FiltrosAuditoriaInput = z.infer<typeof filtrosAuditoriaSchema>;
