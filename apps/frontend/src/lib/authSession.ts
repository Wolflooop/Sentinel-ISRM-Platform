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

/**
 * Único punto de verdad para "¿hay una sesión válida en el cliente?".
 *
 * Valida presencia del token (vía tokenStorage) y, adicionalmente, que el
 * JWT no esté vencido según su propio claim `exp` (evita que un token
 * expirado siga sentado en localStorage y pase como "autenticado" solo
 * porque existe la clave). Esto NO reemplaza la verificación de firma ni la
 * revocación de sesión — eso ocurre exclusivamente en el backend
 * (middleware/authenticate.ts) en cada request; esta función es solo un
 * filtro rápido en el cliente para decidir si mostrar la UI protegida.
 *
 * Reutilizada por ProtectedRoute, RootRedirect (AppRouter) y AppShell para
 * no duplicar la lógica de "¿está autenticado?" en tres lugares distintos.
 */
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
