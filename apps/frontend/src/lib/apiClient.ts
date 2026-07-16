import axios, { AxiosError } from "axios";
import { tokenStorage } from "./tokenStorage";
import { publishHttpNotification } from "./httpNotifications";

/**
 * Instancia base de Axios para todas las llamadas HTTP al backend.
 *
 * Regla de arquitectura frontend (Constitución, Sección 5): toda llamada de
 * red vive en `features/<modulo>/services/`, nunca directamente en
 * componentes. Este cliente es el punto único de configuración (baseURL,
 * interceptores de auth, manejo de errores).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de autenticación: adjunta el JWT almacenado a cada petición.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Rutas de `auth` excluidas del manejo global de errores.
 *
 * `/auth/login` ya tiene su propio manejo de errores en LoginPage (un 401
 * ahí es "credenciales inválidas", un error de negocio — no una sesión
 * expirada, y no debe disparar limpieza de sesión ni redirección).
 * `/auth/logout` ya limpia la sesión y navega por su cuenta en
 * `useLogout` (features/auth/hooks/useAuth.ts) vía `onSettled`; dejarlo
 * pasar aquí evita ejecutar la limpieza dos veces y evita cualquier
 * posibilidad de bucle si el logout mismo devuelve 401 (sesión ya vencida).
 */
const RUTAS_AUTH_EXCLUIDAS = ["/auth/login", "/auth/logout"];

function esRutaAuthExcluida(url?: string): boolean {
  return Boolean(url) && RUTAS_AUTH_EXCLUIDAS.some((ruta) => url!.includes(ruta));
}

function forzarLogoutPorSesionInvalida(): void {
  // tokenStorage sigue siendo la única fuente de verdad de la sesión — este
  // interceptor no introduce ningún estado de auth paralelo, solo reacciona
  // a lo que el backend ya determinó (401 = sesión inválida/vencida/revocada).
  tokenStorage.clear();

  // Redirección dura e intencional: este módulo no es un componente de
  // React (no hay acceso al `navigate` de react-router aquí), y una recarga
  // completa además descarta cualquier estado en memoria — cache de
  // React Query, estado de componentes — que pudiera seguir referenciando
  // datos de la sesión que se acaba de invalidar.
  window.location.assign("/login");
}

// Interceptor de respuesta: manejo centralizado de 401 / 403 / 500.
// Cualquier otro código (400 validación, 404, 409 conflicto, 423 bloqueo,
// etc.) se propaga sin tocar — son errores de negocio que cada módulo ya
// sabe interpretar y mostrar.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (esRutaAuthExcluida(url)) {
      return Promise.reject(error);
    }

    if (status === 401) {
      forzarLogoutPorSesionInvalida();
      return Promise.reject(error);
    }

    if (status === 403) {
      const mensaje =
        (error.response?.data as { error?: string } | undefined)?.error ??
        "Acceso denegado: no tienes permisos para esta acción.";
      publishHttpNotification({ type: "acceso-denegado", message: mensaje });
      return Promise.reject(error);
    }

    if (status === 500) {
      // Nunca se muestran detalles internos (stack, mensaje crudo del
      // servidor) — el backend ya los omite en producción, pero aquí se
      // fuerza un mensaje genérico también en desarrollo para mantener el
      // mismo comportamiento visible al usuario en cualquier ambiente.
      publishHttpNotification({
        type: "error-servidor",
        message: "Ocurrió un error interno. Intenta nuevamente más tarde.",
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
