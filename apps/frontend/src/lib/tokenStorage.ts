const TOKEN_STORAGE_KEY = "sentinel_isrm_token";

/**
 * Punto único de acceso al almacenamiento del JWT en el navegador.
 * Usado tanto por el interceptor de `apiClient` como por `features/auth`,
 * para no duplicar la clave de storage en dos lugares distintos.
 */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
