import { AppError } from "../../../shared/AppError";
import {
  findRegistroAuditoriaPorId,
  findRegistrosAuditoria,
} from "../repository/audit.repository";
import { FiltrosAuditoria, RegistroAuditoria } from "../types/audit.types";

export async function listarRegistrosAuditoria(
  organizacionId: string,
  filtros: FiltrosAuditoria
): Promise<RegistroAuditoria[]> {
  return findRegistrosAuditoria(organizacionId, filtros);
}

export async function obtenerRegistroAuditoria(
  id: string,
  organizacionId: string
): Promise<RegistroAuditoria> {
  const registro = await findRegistroAuditoriaPorId(id, organizacionId);
  if (!registro) {
    throw new AppError("Registro de auditoría no encontrado", 404);
  }
  return registro;
}
