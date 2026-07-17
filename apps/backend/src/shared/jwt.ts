import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";


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


export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
