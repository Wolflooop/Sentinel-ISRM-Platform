import { z } from "zod";

/**
 * `organizacionId` nunca se acepta desde el cliente — siempre se resuelve
 * desde `req.user.organizacionId` (JWT), igual que en el resto de módulos.
 *
 * `criticidad` (1-5): restricción de dominio que schema.prisma documenta
 * explícitamente como no aplicable vía CHECK nativo de Prisma — se valida
 * aquí en Zod, como indica el propio comentario del schema.
 */

export const crearActivoSchema = z.object({
  categoriaId: z.string().uuid("categoriaId debe ser un identificador válido"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  descripcion: z.string().trim().optional(),
  usuarioResponsableId: z.string().uuid("usuarioResponsableId debe ser un identificador válido"),
  ubicacion: z.string().trim().optional(),
  criticidad: z.number().int().min(1).max(5),
  valorEconomicoEstimado: z.number().nonnegative().optional(),
});
export type CrearActivoInput = z.infer<typeof crearActivoSchema>;

export const actualizarActivoSchema = z
  .object({
    categoriaId: z.string().uuid().optional(),
    nombre: z.string().trim().min(1).optional(),
    descripcion: z.string().trim().optional(),
    usuarioResponsableId: z.string().uuid().optional(),
    ubicacion: z.string().trim().optional(),
    criticidad: z.number().int().min(1).max(5).optional(),
    valorEconomicoEstimado: z.number().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarActivoInput = z.infer<typeof actualizarActivoSchema>;

export const cambiarEstadoActivoSchema = z.object({
  estado: z.enum(["ACTIVO", "INACTIVO", "RETIRADO"]),
});
export type CambiarEstadoActivoInput = z.infer<typeof cambiarEstadoActivoSchema>;

export const filtrosActivosSchema = z.object({
  categoriaId: z.string().uuid().optional(),
  criticidad: z.coerce.number().int().min(1).max(5).optional(),
  estado: z.enum(["ACTIVO", "INACTIVO", "RETIRADO"]).optional(),
  busqueda: z.string().trim().min(1).optional(),
});
export type FiltrosActivosInput = z.infer<typeof filtrosActivosSchema>;
