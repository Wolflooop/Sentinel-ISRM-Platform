import axios, { AxiosError } from "axios";
import { tokenStorage } from "./tokenStorage";
import { publishHttpNotification } from "./httpNotifications";


export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const RUTAS_AUTH_EXCLUIDAS = ["/auth/login", "/auth/logout"];

function esRutaAuthExcluida(url?: string): boolean {
  return Boolean(url) && RUTAS_AUTH_EXCLUIDAS.some((ruta) => url!.includes(ruta));
}

function forzarLogoutPorSesionInvalida(): void {
  tokenStorage.clear();
  window.location.assign("/login");
}

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
    
      publishHttpNotification({
        type: "error-servidor",
        message: "Ocurrió un error interno. Intenta nuevamente más tarde.",
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
