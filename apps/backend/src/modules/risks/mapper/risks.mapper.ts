import { RiesgoConRelaciones } from "../types/risks.types";
import { RiesgoHistorialEntrada } from "../../history/types/history.types";
import { RiesgoResponseDTO, RiesgoHistorialResponseDTO } from "../dto/risks.dto";


export function toRiesgoResponseDTO(riesgo: RiesgoConRelaciones): RiesgoResponseDTO {
  return {
    id: riesgo.id,
    probabilidad: riesgo.probabilidad,
    impacto: riesgo.impacto,
    valorRiesgo: riesgo.valorRiesgo,
    nivelRiesgoInherente: riesgo.nivelRiesgoInherente,
    nivelRiesgoResidual: riesgo.nivelRiesgoResidual,
    estado: riesgo.estado,
    fechaUltimoCalculo: riesgo.fechaUltimoCalculo.toISOString(),
    creadoEn: riesgo.creadoEn.toISOString(),
    activo: riesgo.aav.activo,
    amenaza: riesgo.aav.amenaza,
    vulnerabilidad: riesgo.aav.vulnerabilidad,
  };
}

export function toRiesgoResponseListDTO(riesgos: RiesgoConRelaciones[]): RiesgoResponseDTO[] {
  return riesgos.map(toRiesgoResponseDTO);
}

export function toRiesgoHistorialResponseDTO(
  entrada: RiesgoHistorialEntrada
): RiesgoHistorialResponseDTO {
  return {
    id: entrada.id,
    estadoAnterior: entrada.estadoAnterior,
    estadoNuevo: entrada.estadoNuevo,
    comentario: entrada.comentario,
    createdAt: entrada.createdAt.toISOString(),
    usuario: {
      id: entrada.usuario.id,
      nombre: entrada.usuario.nombre,
      rol: entrada.usuario.rol.nombre,
    },
  };
}

export function toRiesgoHistorialResponseListDTO(
  entradas: RiesgoHistorialEntrada[]
): RiesgoHistorialResponseDTO[] {
  return entradas.map(toRiesgoHistorialResponseDTO);
}
