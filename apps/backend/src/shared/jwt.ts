import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { TipoRol } from "@prisma/client";
import { env } from "../config/env";


export interface AuthTokenPayload extends JwtPayload {
  sub: string; // Usuario.id
  // null para el Administrador Principal (SUPER_ADMIN): es un usuario
  // global que no pertenece a ninguna organización.
  organizacionId: string | null;
  rolId: string;
  // Nivel jerárquico real del rol (ver enum TipoRol). Todas las decisiones
  // de jerarquía (quién puede crear a quién, elegir organización, etc.) se
  // basan en este campo del token, nunca en el nombre del rol.
  tipoRol: TipoRol;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as AuthTokenPayload;
}


export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
