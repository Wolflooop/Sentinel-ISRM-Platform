import { tokenStorage } from "./tokenStorage";


interface AuthTokenPayload {
  sub: string;
  // null para el Administrador Principal (SUPER_ADMIN).
  organizacionId: string | null;
  rolId: string;
  tipoRol: "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";
  exp?: number;
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}


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

// Útil para decisiones de UI que dependen de la jerarquía (mostrar el
// selector de organización, el módulo de organizaciones, etc.) antes de que
// el perfil completo (GET /auth/me) haya cargado.
export function esSuperAdminActual(): boolean {
  return getAuthSession()?.tipoRol === "SUPER_ADMIN";
}

// Identidad estable de la sesión actual (usuario + rol). El perfil y los
// permisos devueltos por GET /api/auth/me dependen exactamente de estos dos
// valores, así que cualquier query que dependa del perfil debe incluirlos en
// su queryKey: si cambian (otro usuario, o el mismo usuario con otro rol),
// React Query debe tratarlo como una entrada de caché distinta, sin
// necesidad de invalidación manual.
export function getAuthSessionId(): string | null {
  const session = getAuthSession();
  if (!session) {
    return null;
  }
  return `${session.sub}:${session.rolId}`;
}


export function hasValidSession(): boolean {
  const session = getAuthSession();
  if (!session) {
    return false;
  }
  if (session.exp !== undefined && session.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
}
