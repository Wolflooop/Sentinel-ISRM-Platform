import { useQuery } from "@tanstack/react-query";
import { obtenerPerfilActualRequest } from "../services/authService";
import { hasValidSession } from "../../../lib/authSession";

/**
 * Perfil y permisos reales del usuario autenticado (GET /auth/me).
 *
 * Fuente de verdad para todo lo que en el frontend depende de "¿qué puede
 * hacer este usuario?": menú/sidebar dinámico (AppShell), botones ocultos
 * por permiso (ConPermiso) y rutas protegidas por permiso (RequierePermiso).
 * No se duplica esta lógica en tres lugares distintos — todos consumen este
 * mismo hook.
 *
 * `enabled: hasValidSession()` evita disparar la petición en /login o antes
 * de que exista sesión.
 */
export function usePerfilActual() {
  return useQuery({
    queryKey: ["auth", "perfil-actual"],
    queryFn: obtenerPerfilActualRequest,
    enabled: hasValidSession(),
    staleTime: 5 * 60 * 1000,
  });
}
