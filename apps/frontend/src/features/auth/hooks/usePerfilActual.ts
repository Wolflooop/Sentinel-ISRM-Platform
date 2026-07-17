import { useQuery } from "@tanstack/react-query";
import { obtenerPerfilActualRequest } from "../services/authService";
import { hasValidSession } from "../../../lib/authSession";


export function usePerfilActual() {
  return useQuery({
    queryKey: ["auth", "perfil-actual"],
    queryFn: obtenerPerfilActualRequest,
    enabled: hasValidSession(),
    staleTime: 5 * 60 * 1000,
  });
}
