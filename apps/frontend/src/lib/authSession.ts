import { tokenStorage } from "./tokenStorage";

/**
 * Payload del JWT emitido por el backend (ver apps/backend/src/shared/jwt.ts
 * — AuthTokenPayload). Se decodifica únicamente para lectura en el cliente
 * (p. ej. organizacionId para scoping de consultas); la verificación de
 * firma ocurre solo en el backend, nunca aquí.
 */
interface AuthTokenPayload {
  sub: string;
  organizacionId: string;
  rolId: string;
  exp?: number;
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

/**
 * Decodifica el payload del token almacenado. Devuelve null si no hay
 * sesión activa o si el token está corrupto/malformado.
 */
export function getAuthSession(): AuthTokenPayload | null {
  const token = tokenStorage.get();
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as AuthTokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export function getOrganizacionIdActual(): string | null {
  return getAuthSession()?.organizacionId ?? null;
}
