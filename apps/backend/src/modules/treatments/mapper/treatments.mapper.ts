import { TratamientoConRelaciones } from "../types/treatments.types";
import { TratamientoResponseDTO } from "../dto/treatments.dto";

export function toTratamientoResponseDTO(tratamiento: TratamientoConRelaciones): TratamientoResponseDTO {
  return {
    id: tratamiento.id,
    riesgoId: tratamiento.riesgoId,
    evaluacionOrigenId: tratamiento.evaluacionOrigenId,
    estrategia: tratamiento.estrategia,
    descripcionPlan: tratamiento.descripcionPlan,
    usuarioResponsableId: tratamiento.usuarioResponsableId,
    fechaInicio: tratamiento.fechaInicio ? tratamiento.fechaInicio.toISOString() : null,
    justificacion: tratamiento.justificacion,
    aprobadoPorId: tratamiento.aprobadoPorId,
    fechaAprobacion: tratamiento.fechaAprobacion ? tratamiento.fechaAprobacion.toISOString() : null,
    fechaLimite: tratamiento.fechaLimite.toISOString(),
    estado: tratamiento.estado,
    porcentajeAvance: tratamiento.porcentajeAvance,
    riesgo: {
      id: tratamiento.riesgo.id,
      estado: tratamiento.riesgo.estado,
      origen: tratamiento.riesgo.origen,
      titulo: tratamiento.riesgo.titulo,
    },
    evaluacionOrigen: tratamiento.evaluacionOrigen
      ? {
          id: tratamiento.evaluacionOrigen.id,
          resultado: tratamiento.evaluacionOrigen.resultado,
          justificacion: tratamiento.evaluacionOrigen.justificacion,
          fechaEvaluacion: tratamiento.evaluacionOrigen.fechaEvaluacion.toISOString(),
        }
      : null,
    usuarioResponsable: {
      id: tratamiento.usuarioResponsable.id,
      nombre: tratamiento.usuarioResponsable.nombre,
      email: tratamiento.usuarioResponsable.email,
    },
    aprobadoPor: tratamiento.aprobadoPor
      ? {
          id: tratamiento.aprobadoPor.id,
          nombre: tratamiento.aprobadoPor.nombre,
          email: tratamiento.aprobadoPor.email,
        }
      : null,
    controles: tratamiento.controles.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      estadoImplementacion: c.estadoImplementacion,
      esPrincipal: c.esPrincipal,
    })),
  };
}

export function toTratamientoResponseListDTO(tratamientos: TratamientoConRelaciones[]): TratamientoResponseDTO[] {
  return tratamientos.map(toTratamientoResponseDTO);
}
