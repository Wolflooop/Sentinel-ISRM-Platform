import bcrypt from "bcrypt";

/**
 * Utilidades de contraseña compartidas. Único punto autorizado en todo el
 * backend para invocar bcrypt directamente (Constitución, Sección "Seguridad").
 */

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
