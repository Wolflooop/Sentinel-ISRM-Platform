import { useQuery } from "@tanstack/react-query";
import { obtenerPerfilActualRequest } from "../services/authService";
import { hasValidSession, getAuthSessionId } from "../../../lib/authSession";


export function usePerfilActual() {
  // La queryKey incluye la identidad de la sesión (usuario + rol) porque el
  // perfil/permisos que devuelve GET /api/auth/me dependen exactamente de
  // esos dos valores. Con esto, un usuario distinto (o el mismo usuario con
  // un rol distinto) obtiene una entrada de caché completamente separada:
  // React Query nunca puede devolver, por diseño, el perfil de otra sesión.
  const sessionId = getAuthSessionId();

  return useQuery({
    queryKey: ["auth", "perfil-actual", sessionId],
    queryFn: obtenerPerfilActualRequest,
    enabled: hasValidSession(),
    staleTime: 5 * 60 * 1000,
  });
}
