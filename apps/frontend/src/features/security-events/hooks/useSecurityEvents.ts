import { useQuery } from "@tanstack/react-query";
import { getSecurityEvents } from "../services/securityEventsService";
import { FiltrosEventosSeguridad } from "../types/security-events.types";

export function useSecurityEvents(filtros: FiltrosEventosSeguridad = {}) {
  return useQuery({
    queryKey: ["eventosSeguridad", filtros],
    queryFn: () => getSecurityEvents(filtros),
  });
}
