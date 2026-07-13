import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Esquema de validación de variables de entorno.
 *
 * Solo se validan aquí las variables necesarias para la infraestructura base
 * (Fase 1). Variables específicas de módulos funcionales (auth, reportes,
 * etc.) se agregarán en sus fases correspondientes, no antes.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET es obligatorio"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.string().default("info"),

  // Política de bloqueo de usuario por intentos fallidos — INFORMACIÓN
  // PENDIENTE DE DEFINICIÓN (Constitución: no inventar número máximo de
  // intentos ni tiempo de bloqueo). Deliberadamente sin `.default(...)`:
  // si no se configuran, la funcionalidad de bloqueo queda preparada pero
  // inactiva (ver auth.service.ts). Ningún valor mágico vive en el código.
  AUTH_MAX_INTENTOS_FALLIDOS: z.coerce.number().int().positive().optional(),
  AUTH_BLOQUEO_MINUTOS: z.coerce.number().int().positive().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fallo temprano y explícito: no arrancar el servidor con configuración inválida.
  // eslint-disable-next-line no-console
  console.error("Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno inválida. Revisa el archivo .env contra .env.example.");
}

export const env = parsed.data;
