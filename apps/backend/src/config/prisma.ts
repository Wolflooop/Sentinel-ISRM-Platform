import { PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Instancia única de Prisma Client para toda la aplicación.
 *
 * Regla de la Constitución (Sección 4): Prisma Client solo debe usarse desde
 * la capa de Repository. Ningún Controller o Service debe importar este
 * módulo directamente.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
