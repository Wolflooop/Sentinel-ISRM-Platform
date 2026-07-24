import { apiClient } from "../../../lib/apiClient";
import { FiltrosEventosSeguridad, SecurityEvent } from "../types/security-events.types";

// Endpoint ya existente en el backend (apps/backend/src/app.ts):
// app.use("/api/eventos-seguridad", securityEventsRouter). No se crea ningún
// endpoint nuevo.
export async function getSecurityEvents(
  filtros: FiltrosEventosSeguridad = {}
): Promise<SecurityEvent[]> {
  const { data } = await apiClient.get<SecurityEvent[]>("/eventos-seguridad", {
    params: filtros,
  });
  return data;
}
