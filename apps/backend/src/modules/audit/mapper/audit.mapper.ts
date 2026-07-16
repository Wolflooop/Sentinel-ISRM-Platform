import { RegistroAuditoria } from "../types/audit.types";
import { RegistroAuditoriaResponseDTO } from "../dto/audit.dto";

export function toRegistroAuditoriaResponseDTO(
  registro: RegistroAuditoria
): RegistroAuditoriaResponseDTO {
  return {
    id: registro.id,
    entidad: registro.entidad,
    entidadId: registro.entidadId,
    accion: registro.accion,
    datosAnteriores: registro.datosAnteriores,
    datosNuevos: registro.datosNuevos,
    direccionIp: registro.direccionIp,
    fecha: registro.fecha.toISOString(),
    usuario: registro.usuario,
  };
}

export function toRegistroAuditoriaResponseListDTO(
  registros: RegistroAuditoria[]
): RegistroAuditoriaResponseDTO[] {
  return registros.map(toRegistroAuditoriaResponseDTO);
}
