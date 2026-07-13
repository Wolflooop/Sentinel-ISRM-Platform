import { TratamientoConRelaciones } from "../types/treatments.types";
import { TratamientoResponseDTO } from "../dto/treatments.dto";

export function toTratamientoResponseDTO(tratamiento: TratamientoConRelaciones): TratamientoResponseDTO {
  return {
    id: tratamiento.id,
    evaluacionId: tratamiento.evaluacionId,
    controlPrincipalId: tratamiento.controlPrincipalId,
    estrategia: tratamiento.estrategia,
    descripcionPlan: tratamiento.descripcionPlan,
    usuarioResponsableId: tratamiento.usuarioResponsableId,
    fechaLimite: tratamiento.fechaLimite.toISOString(),
    estado: tratamiento.estado,
    porcentajeAvance: tratamiento.porcentajeAvance,
    evaluacion: {
      id: tratamiento.evaluacion.id,
      resultado: tratamiento.evaluacion.resultado,
      justificacion: tratamiento.evaluacion.justificacion,
      fechaEvaluacion: tratamiento.evaluacion.fechaEvaluacion.toISOString(),
      riesgo: {
        id: tratamiento.evaluacion.riesgo.id,
        valorRiesgo: tratamiento.evaluacion.riesgo.valorRiesgo,
        nivelRiesgoInherente: tratamiento.evaluacion.riesgo.nivelRiesgoInherente,
        estado: tratamiento.evaluacion.riesgo.estado,
      },
      contexto: {
        id: tratamiento.evaluacion.contexto.id,
        alcance: tratamiento.evaluacion.contexto.alcance,
        activo: tratamiento.evaluacion.contexto.activo,
      },
      usuario: {
        id: tratamiento.evaluacion.usuario.id,
        nombre: tratamiento.evaluacion.usuario.nombre,
        email: tratamiento.evaluacion.usuario.email,
      },
    },
    controlPrincipal: tratamiento.controlPrincipal
      ? {
          id: tratamiento.controlPrincipal.id,
          nombre: tratamiento.controlPrincipal.nombre,
          tipo: tratamiento.controlPrincipal.tipo,
          estadoImplementacion: tratamiento.controlPrincipal.estadoImplementacion,
        }
      : null,
    usuarioResponsable: {
      id: tratamiento.usuarioResponsable.id,
      nombre: tratamiento.usuarioResponsable.nombre,
      email: tratamiento.usuarioResponsable.email,
    },
  };
}

export function toTratamientoResponseListDTO(tratamientos: TratamientoConRelaciones[]): TratamientoResponseDTO[] {
  return tratamientos.map(toTratamientoResponseDTO);
}
