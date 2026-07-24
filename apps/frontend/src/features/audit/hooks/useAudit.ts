import { useQuery } from "@tanstack/react-query";
import { getAuditRecords } from "../services/auditService";
import { FiltrosAuditoria } from "../types/audit.types";

export function useAuditRecords(filtros: FiltrosAuditoria = {}) {
  return useQuery({
    queryKey: ["auditoria", filtros],
    queryFn: () => getAuditRecords(filtros),
  });
}
