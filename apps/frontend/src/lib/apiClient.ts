import axios from "axios";

/**
 * Instancia base de Axios para todas las llamadas HTTP al backend.
 *
 * Regla de arquitectura frontend (Constitución, Sección 5): toda llamada de
 * red vive en `features/<modulo>/services/`, nunca directamente en
 * componentes. Este cliente es el punto único de configuración (baseURL,
 * interceptores de auth, manejo de errores), a extender en fases posteriores
 * cuando se implemente el módulo de Autenticación.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
