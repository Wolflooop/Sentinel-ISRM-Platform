import { apiClient } from "../../../lib/apiClient";
import { AuditRecord, FiltrosAuditoria } from "../types/audit.types";

// Endpoint ya existente en el backend (apps/backend/src/app.ts):
// app.use("/api/auditoria", auditRouter). No se crea ningún endpoint nuevo.
export async function getAuditRecords(
  filtros: FiltrosAuditoria = {}
): Promise<AuditRecord[]> {
  const { data } = await apiClient.get<AuditRecord[]>("/auditoria", {
    params: filtros,
  });
  return data;
}
