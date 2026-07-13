import { z } from "zod";

/**
 * `organizacionId` nunca se acepta desde el cliente — siempre se resuelve
 * desde `req.user.organizacionId` (JWT), igual que en users/roles/organizations.
 */

export const crearContextoSchema = z.object({
  alcance: z.string().trim().min(1, "El alcance es obligatorio"),
  criteriosAceptacion: z.string().trim().min(1, "Los criterios de aceptación son obligatorios"),
});
export type CrearContextoInput = z.infer<typeof crearContextoSchema>;

export const actualizarContextoSchema = z
  .object({
    alcance: z.string().trim().min(1).optional(),
    criteriosAceptacion: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo a actualizar",
  });
export type ActualizarContextoInput = z.infer<typeof actualizarContextoSchema>;

const escalaItemSchema = z.object({
  nivel: z.number().int().min(1).max(5),
  etiqueta: z.string().trim().min(1, "La etiqueta es obligatoria"),
  descripcion: z.string().trim().optional(),
});

/**
 * Fase 5 — Reglas de Integridad: "Debe definirse la escala completa de
 * impacto/probabilidad (niveles 1 a 5) antes de que el contexto pueda
 * activarse". Se modela como reemplazo atómico de la escala completa (los 5
 * niveles, cada uno exactamente una vez) en una sola operación, en vez de
 * un CRUD incremental nivel por nivel — evita estados intermedios con
 * niveles duplicados o huecos.
 */
export const reemplazarEscalaSchema = z
  .object({
    niveles: z.array(escalaItemSchema).length(5, "Debe enviar exactamente los 5 niveles (1 a 5)"),
  })
  .refine(
    (data) => {
      const nivelesUnicos = new Set(data.niveles.map((n) => n.nivel));
      return nivelesUnicos.size === 5 && [1, 2, 3, 4, 5].every((n) => nivelesUnicos.has(n));
    },
    { message: "Los niveles deben ser exactamente 1, 2, 3, 4 y 5, sin repetidos ni huecos" }
  );
export type ReemplazarEscalaInput = z.infer<typeof reemplazarEscalaSchema>;

const matrizCeldaSchema = z.object({
  nivelProbabilidad: z.number().int().min(1).max(5),
  nivelImpacto: z.number().int().min(1).max(5),
  nivelResultante: z.enum(["BAJO", "MEDIO", "ALTO", "CRITICO"]),
});

/**
 * Fase 5: "Debe completarse la matriz con las 25 combinaciones posibles de
 * probabilidad × impacto, sin huecos, antes de que el contexto pueda
 * activarse". Mismo criterio de reemplazo atómico que las escalas.
 */
export const reemplazarMatrizSchema = z
  .object({
    celdas: z.array(matrizCeldaSchema).length(25, "Debe enviar exactamente las 25 combinaciones"),
  })
  .refine(
    (data) => {
      const combos = new Set(data.celdas.map((c) => `${c.nivelProbabilidad}-${c.nivelImpacto}`));
      if (combos.size !== 25) return false;
      for (let p = 1; p <= 5; p++) {
        for (let i = 1; i <= 5; i++) {
          if (!combos.has(`${p}-${i}`)) return false;
        }
      }
      return true;
    },
    { message: "Deben estar las 25 combinaciones de probabilidad (1-5) x impacto (1-5), sin repetidos ni huecos" }
  );
export type ReemplazarMatrizInput = z.infer<typeof reemplazarMatrizSchema>;
