import { Prisma } from "@prisma/client";
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
): Promise<{ id: string; riesgo: { id: string } } | null> {
  return prisma.evaluacion.findFirst({
    where: {
      id: evaluacionId,
      riesgo: {
        aav: {
          activo: { organizacionId },
        },
      },
    },
    select: { id: true, riesgo: { select: { id: true } } },
  });
}

export async function findControlPrincipalPorIdYOrganizacion(
  controlId: string,
  organizacionId: string
): Promise<{ id: string; tipo: string } | null> {
  return prisma.control.findFirst({
    where: {
      id: controlId,
      OR: [{ organizacionId: null }, { organizacionId }],
    },
    select: { id: true, tipo: true },
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

async function calcularNivelResidual(
  tx: Prisma.TransactionClient,
  evaluacionId: string,
  estrategia: string,
  controlPrincipalTipo: string | null
) {
  const evaluacion = await tx.evaluacion.findUnique({
    where: { id: evaluacionId },
    select: {
      contextoId: true,
      riesgo: { select: { probabilidad: true, impacto: true, nivelRiesgoInherente: true } },
    },
  });
  if (!evaluacion) {
    return null;
  }

  if (estrategia === "EVITAR" || estrategia === "TRANSFERIR") {
    return "BAJO" as const;
  }

  if (estrategia === "ACEPTAR") {
    return evaluacion.riesgo.nivelRiesgoInherente;
  }

  // estrategia === "MITIGAR"
  if (!controlPrincipalTipo) {
    return null;
  }

  let nivelProbabilidad = evaluacion.riesgo.probabilidad;
  let nivelImpacto = evaluacion.riesgo.impacto;
  if (controlPrincipalTipo === "PREVENTIVO") {
    nivelProbabilidad = Math.max(1, nivelProbabilidad - 1);
  } else {
    // DETECTIVO o CORRECTIVO
    nivelImpacto = Math.max(1, nivelImpacto - 1);
  }

  const celda = await tx.matrizRiesgo.findUnique({
    where: {
      contextoId_nivelProbabilidad_nivelImpacto: {
        contextoId: evaluacion.contextoId,
        nivelProbabilidad,
        nivelImpacto,
      },
    },
    select: { nivelResultante: true },
  });

  return celda?.nivelResultante ?? null;
}


export async function crearTratamiento(
  params: CrearTratamientoParams & { riesgoId: string; controlPrincipalTipo: string | null }
): Promise<TratamientoConRelaciones> {
  const nuevoEstadoRiesgo =
    params.estado === "EN_PROGRESO" ? "MONITOREADO" : params.estado === "IMPLEMENTADO" ? "CERRADO" : "TRATADO";

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const nivelResidual =
      params.estado === "IMPLEMENTADO"
        ? await calcularNivelResidual(tx, params.evaluacionId, params.estrategia, params.controlPrincipalTipo)
        : null;

    await tx.riesgo.update({
      where: { id: params.riesgoId },
      data: {
        estado: nuevoEstadoRiesgo,
        ...(nivelResidual ? { nivelRiesgoResidual: nivelResidual, fechaUltimoCalculo: new Date() } : {}),
      },
    });

    return tx.tratamiento.create({
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
  });
}


export async function actualizarTratamiento(
  id: string,
  params: ActualizarTratamientoParams,
  contexto: {
    riesgoId: string;
    evaluacionId: string;
    estrategiaFinal: string;
    controlPrincipalTipoFinal: string | null;
  }
): Promise<TratamientoConRelaciones> {
  const nuevoEstadoRiesgo =
    params.estado === "EN_PROGRESO" ? "MONITOREADO" : params.estado === "IMPLEMENTADO" ? "CERRADO" : null;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (nuevoEstadoRiesgo) {
      const nivelResidual =
        params.estado === "IMPLEMENTADO"
          ? await calcularNivelResidual(
              tx,
              contexto.evaluacionId,
              contexto.estrategiaFinal,
              contexto.controlPrincipalTipoFinal
            )
          : null;

      await tx.riesgo.update({
        where: { id: contexto.riesgoId },
        data: {
          estado: nuevoEstadoRiesgo,
          ...(nivelResidual ? { nivelRiesgoResidual: nivelResidual, fechaUltimoCalculo: new Date() } : {}),
        },
      });
    }

    return tx.tratamiento.update({
      where: { id },
      data: params,
      include: TRATAMIENTO_INCLUDE,
    });
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
