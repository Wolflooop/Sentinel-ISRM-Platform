import { RiesgoConRelaciones } from "../types/risks.types";
import { RiesgoHistorialEntrada } from "../../history/types/history.types";
import { RiesgoResponseDTO, RiesgoHistorialResponseDTO } from "../dto/risks.dto";

export function toRiesgoResponseDTO(riesgo: RiesgoConRelaciones): RiesgoResponseDTO {
  return {
    id: riesgo.id,
    origen: riesgo.origen,
    titulo: riesgo.titulo,
    descripcion: riesgo.descripcion,
    justificacionOrigen: riesgo.justificacionOrigen,
    estado: riesgo.estado,
    creadoEn: riesgo.creadoEn.toISOString(),
    creador: riesgo.creador,
    responsable: riesgo.responsable,
    categoriaIdentificacion: riesgo.categoriaIdentificacion,
    activo: riesgo.aav?.activo ?? null,
    amenaza: riesgo.aav?.amenaza ?? null,
    vulnerabilidad: riesgo.aav?.vulnerabilidad ?? null,
    evaluacionActual: riesgo.evaluacionActual
      ? {
          id: riesgo.evaluacionActual.id,
          tipoEvaluacion: riesgo.evaluacionActual.tipoEvaluacion,
          probabilidad: riesgo.evaluacionActual.probabilidad,
          impacto: riesgo.evaluacionActual.impacto,
          valorCalculado: riesgo.evaluacionActual.valorCalculado,
          nivelRiesgo: riesgo.evaluacionActual.nivelRiesgo,
          fechaEvaluacion: riesgo.evaluacionActual.fechaEvaluacion.toISOString(),
        }
      : null,
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
