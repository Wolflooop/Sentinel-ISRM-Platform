import { tokenStorage } from "./tokenStorage";


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
