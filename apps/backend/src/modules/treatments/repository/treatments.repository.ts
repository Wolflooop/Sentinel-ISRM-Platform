import { prisma } from "../../../config/prisma";
import {
  ActualizarTratamientoParams,
  CrearTratamientoParams,
  FiltrosTratamientos,
  TratamientoConRelaciones,
} from "../types/treatments.types";

const TRATAMIENTO_INCLUDE = {
  evaluacion: {
    select: {
      id: true,
      resultado: true,
      justificacion: true,
      fechaEvaluacion: true,
      riesgo: {
        select: {
          id: true,
          valorRiesgo: true,
          nivelRiesgoInherente: true,
          estado: true,
        },
      },
      contexto: {
        select: {
          id: true,
          alcance: true,
          activo: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    },
  },
  controlPrincipal: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      estadoImplementacion: true,
    },
  },
  usuarioResponsable: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
} as const;

function whereOrganizacion(organizacionId: string) {
  return {
    evaluacion: {
      riesgo: {
        aav: {
          activo: {
            organizacionId,
          },
        },
      },
    },
  };
}

export async function findTratamientos(
  organizacionId: string,
  filtros: FiltrosTratamientos
): Promise<TratamientoConRelaciones[]> {
  return prisma.tratamiento.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.evaluacionId ? { evaluacionId: filtros.evaluacionId } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.estrategia ? { estrategia: filtros.estrategia } : {}),
    },
    include: TRATAMIENTO_INCLUDE,
    orderBy: { fechaLimite: "asc" },
  });
}

export async function findTratamientoPorId(
  id: string,
  organizacionId: string
): Promise<TratamientoConRelaciones | null> {
  return prisma.tratamiento.findFirst({
    where: { id, ...whereOrganizacion(organizacionId) },
    include: TRATAMIENTO_INCLUDE,
  });
}

export async function findTratamientoPorEvaluacionId(
  evaluacionId: string,
  organizacionId: string
): Promise<TratamientoConRelaciones | null> {
  return prisma.tratamiento.findFirst({
    where: {
      evaluacionId,
      ...whereOrganizacion(organizacionId),
    },
    include: TRATAMIENTO_INCLUDE,
  });
}

export async function findEvaluacionPorIdYOrganizacion(
  evaluacionId: string,
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.evaluacion.findFirst({
    where: {
      id: evaluacionId,
      riesgo: {
        aav: {
          activo: { organizacionId },
        },
      },
    },
    select: { id: true },
  });
}

export async function findControlPrincipalPorIdYOrganizacion(
  controlId: string,
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.control.findFirst({
    where: {
      id: controlId,
      OR: [{ organizacionId: null }, { organizacionId }],
    },
    select: { id: true },
  });
}

export async function findUsuarioResponsablePorOrganizacion(
  usuarioId: string,
  organizacionId: string
): Promise<{ id: string } | null> {
  return prisma.usuario.findFirst({
    where: { id: usuarioId, organizacionId },
    select: { id: true },
  });
}

export async function crearTratamiento(params: CrearTratamientoParams): Promise<TratamientoConRelaciones> {
  return prisma.tratamiento.create({
    data: {
      evaluacionId: params.evaluacionId,
      controlPrincipalId: params.controlPrincipalId,
      estrategia: params.estrategia,
      descripcionPlan: params.descripcionPlan,
      usuarioResponsableId: params.usuarioResponsableId,
      fechaLimite: params.fechaLimite,
      estado: params.estado,
      porcentajeAvance: params.porcentajeAvance,
    },
    include: TRATAMIENTO_INCLUDE,
  });
}

export async function actualizarTratamiento(
  id: string,
  params: ActualizarTratamientoParams
): Promise<TratamientoConRelaciones> {
  return prisma.tratamiento.update({
    where: { id },
    data: params,
    include: TRATAMIENTO_INCLUDE,
  });
}

export async function registrarAuditoriaTratamiento(params: {
  usuarioId: string;
  organizacionId: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR";
  direccionIp: string;
}): Promise<void> {
  await prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Tratamiento",
      entidadId: params.entidadId,
      accion: params.accion,
      datosNuevos: {
        tratamientoId: params.entidadId,
      } as never,
      direccionIp: params.direccionIp,
    },
  });
}
