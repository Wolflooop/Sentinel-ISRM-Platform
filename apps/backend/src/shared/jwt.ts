import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

/**
 * Utilidades de JWT compartidas. Único punto autorizado en todo el backend
 * para invocar jsonwebtoken directamente (Constitución, Sección "Seguridad").
 *
 * Alcance de esta fase (Fase 2): expiración simple mediante JWT_EXPIRES_IN,
 * sin mecanismo de renovación/refresh — no existe RefreshToken en el modelo
 * (restricción absoluta de la Constitución) ni está definido en la
 * documentación fuente.
 */

export interface AuthTokenPayload extends JwtPayload {
  sub: string; // Usuario.id
  organizacionId: string;
  rolId: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}

/**
 * Sesion.tokenHash requiere un valor determinista (no bcrypt, que genera un
 * salt distinto en cada llamada) para poder localizar la sesión asociada a un
 * token recibido en cada request sin recorrer todas las sesiones activas.
 * SHA-256 es adecuado aquí: el token ya es un secreto de alta entropía
 * firmado por el servidor, no una contraseña de usuario de baja entropía.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
