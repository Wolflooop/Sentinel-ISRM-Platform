import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarTratamientoParams,
  CrearTratamientoParams,
  FiltrosTratamientos,
  TratamientoConRelaciones,
} from "../types/treatments.types";
import { transicionarEstadoRiesgo } from "../../history/service/history.service";

const TRATAMIENTO_INCLUDE = {
  riesgo: {
    select: {
      id: true,
      estado: true,
      origen: true,
      titulo: true,
    },
  },
  evaluacionOrigen: {
    select: {
      id: true,
      resultado: true,
      justificacion: true,
      fechaEvaluacion: true,
    },
  },
  usuarioResponsable: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
  aprobadoPor: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
  controles: {
    include: {
      control: {
        select: { id: true, nombre: true, tipo: true, estadoImplementacion: true },
      },
    },
  },
} as const;

type TratamientoRaw = Prisma.TratamientoGetPayload<{ include: typeof TRATAMIENTO_INCLUDE }>;

function shapeTratamiento(t: TratamientoRaw): TratamientoConRelaciones {
  return {
    id: t.id,
    riesgoId: t.riesgoId,
    evaluacionOrigenId: t.evaluacionOrigenId,
    estrategia: t.estrategia,
    descripcionPlan: t.descripcionPlan,
    usuarioResponsableId: t.usuarioResponsableId,
    fechaInicio: t.fechaInicio,
    justificacion: t.justificacion,
    aprobadoPorId: t.aprobadoPorId,
    fechaAprobacion: t.fechaAprobacion,
    fechaLimite: t.fechaLimite,
    estado: t.estado,
    porcentajeAvance: t.porcentajeAvance,
    riesgo: t.riesgo,
    evaluacionOrigen: t.evaluacionOrigen,
    usuarioResponsable: t.usuarioResponsable,
    aprobadoPor: t.aprobadoPor,
    controles: t.controles.map((tc) => ({
      id: tc.control.id,
      nombre: tc.control.nombre,
      tipo: tc.control.tipo,
      estadoImplementacion: tc.control.estadoImplementacion,
      esPrincipal: tc.esPrincipal,
    })),
  };
}

// V2: Tratamiento cuelga de Riesgo, no de Evaluacion — el aislamiento
// multi-tenant se resuelve por la misma doble cadena que en risks/evaluations.
function whereOrganizacion(organizacionId: string) {
  return {
    riesgo: {
      OR: [
        { aav: { activo: { organizacionId } } },
        { creador: { organizacionId } },
      ],
    },
  };
}

export async function findTratamientos(
  organizacionId: string,
  filtros: FiltrosTratamientos
): Promise<TratamientoConRelaciones[]> {
  const registros = await prisma.tratamiento.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.riesgoId ? { riesgoId: filtros.riesgoId } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.estrategia ? { estrategia: filtros.estrategia } : {}),
    },
    include: TRATAMIENTO_INCLUDE,
    orderBy: { fechaLimite: "asc" },
  });
  return registros.map(shapeTratamiento);
}

export async function findTratamientoPorId(
  id: string,
  organizacionId: string
): Promise<TratamientoConRelaciones | null> {
  const registro = await prisma.tratamiento.findFirst({
    where: { id, ...whereOrganizacion(organizacionId) },
    include: TRATAMIENTO_INCLUDE,
  });
  return registro ? shapeTratamiento(registro) : null;
}

export async function findRiesgoParaTratamiento(
  riesgoId: string,
  organizacionId: string
): Promise<{
  id: string;
  responsableId: string | null;
  evaluacionActualId: string | null;
  evaluacionActual: { id: string; contextoId: string; probabilidad: number; impacto: number } | null;
} | null> {
  const riesgo = await prisma.riesgo.findFirst({
    where: {
      id: riesgoId,
      OR: [
        { aav: { activo: { organizacionId } } },
        { creador: { organizacionId } },
      ],
    },
    select: {
      id: true,
      responsableId: true,
      evaluacionActualId: true,
      evaluacionActual: {
        select: { id: true, contextoId: true, probabilidad: true, impacto: true },
      },
    },
  });
  return riesgo;
}

export async function findEvaluacionOrigenPorIdYOrganizacion(
  evaluacionId: string,
  organizacionId: string
): Promise<{ id: string; riesgoId: string } | null> {
  return prisma.evaluacion.findFirst({
    where: {
      id: evaluacionId,
      riesgo: {
        OR: [
          { aav: { activo: { organizacionId } } },
          { creador: { organizacionId } },
        ],
      },
    },
    select: { id: true, riesgoId: true },
  });
}

export async function findControlesVisiblesPorIds(
  controlIds: string[],
  organizacionId: string
): Promise<Array<{ id: string; tipo: string }>> {
  if (controlIds.length === 0) {
    return [];
  }
  return prisma.control.findMany({
    where: {
      id: { in: controlIds },
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
  riesgo: { evaluacionActual: { id: string; contextoId: string; probabilidad: number; impacto: number } | null },
  estrategia: string,
  controlPrincipalTipo: string | null
) {
  if (!riesgo.evaluacionActual) {
    return null;
  }

  if (estrategia === "EVITAR" || estrategia === "TRANSFERIR") {
    return { nivel: "BAJO" as const, contextoId: riesgo.evaluacionActual.contextoId, probabilidad: riesgo.evaluacionActual.probabilidad, impacto: riesgo.evaluacionActual.impacto, valorCalculado: riesgo.evaluacionActual.probabilidad * riesgo.evaluacionActual.impacto };
  }

  if (estrategia === "ACEPTAR") {
    const celdaActual = await tx.matrizRiesgo.findUnique({
      where: {
        contextoId_nivelProbabilidad_nivelImpacto: {
          contextoId: riesgo.evaluacionActual.contextoId,
          nivelProbabilidad: riesgo.evaluacionActual.probabilidad,
          nivelImpacto: riesgo.evaluacionActual.impacto,
        },
      },
      select: { nivelResultante: true },
    });
    if (!celdaActual) return null;
    return {
      nivel: celdaActual.nivelResultante,
      contextoId: riesgo.evaluacionActual.contextoId,
      probabilidad: riesgo.evaluacionActual.probabilidad,
      impacto: riesgo.evaluacionActual.impacto,
      valorCalculado: riesgo.evaluacionActual.probabilidad * riesgo.evaluacionActual.impacto,
    };
  }

  // estrategia === "MITIGAR"
  if (!controlPrincipalTipo) {
    return null;
  }

  let nivelProbabilidad = riesgo.evaluacionActual.probabilidad;
  let nivelImpacto = riesgo.evaluacionActual.impacto;
  if (controlPrincipalTipo === "PREVENTIVO") {
    nivelProbabilidad = Math.max(1, nivelProbabilidad - 1);
  } else {
    nivelImpacto = Math.max(1, nivelImpacto - 1);
  }

  const celda = await tx.matrizRiesgo.findUnique({
    where: {
      contextoId_nivelProbabilidad_nivelImpacto: {
        contextoId: riesgo.evaluacionActual.contextoId,
        nivelProbabilidad,
        nivelImpacto,
      },
    },
    select: { nivelResultante: true },
  });

  if (!celda) return null;

  return {
    nivel: celda.nivelResultante,
    contextoId: riesgo.evaluacionActual.contextoId,
    probabilidad: nivelProbabilidad,
    impacto: nivelImpacto,
    valorCalculado: nivelProbabilidad * nivelImpacto,
  };
}

/**
 * Cuando el tratamiento completa (estado COMPLETADO) y se puede calcular
 * un nivel residual, se crea una nueva Evaluacion tipo RESIDUAL (V2: el
 * nivel residual ya no vive como campo en Riesgo, ver schema.prisma) y se
 * actualiza Riesgo.evaluacionActualId — mismo criterio de backfill usado
 * en la migración V2 para las evaluaciones INHERENTE.
 */
async function registrarEvaluacionResidualSiAplica(
  tx: Prisma.TransactionClient,
  params: {
    riesgoId: string;
    usuarioId: string;
    residual: { nivel: string; contextoId: string; probabilidad: number; impacto: number; valorCalculado: number } | null;
  }
): Promise<void> {
  if (!params.residual) {
    return;
  }
  const resultado = params.residual.nivel === "BAJO" || params.residual.nivel === "MEDIO" ? "ACEPTABLE" : "NO_ACEPTABLE";

  const evaluacion = await tx.evaluacion.create({
    data: {
      riesgoId: params.riesgoId,
      contextoId: params.residual.contextoId,
      tipoEvaluacion: "RESIDUAL",
      probabilidad: params.residual.probabilidad,
      impacto: params.residual.impacto,
      valorCalculado: params.residual.valorCalculado,
      nivelRiesgo: params.residual.nivel as never,
      resultado: resultado as never,
      justificacion: "Evaluación residual generada automáticamente al completar el tratamiento asociado.",
      usuarioId: params.usuarioId,
    },
  });

  await tx.riesgo.update({
    where: { id: params.riesgoId },
    data: { evaluacionActualId: evaluacion.id },
  });
}

export async function crearTratamiento(
  params: CrearTratamientoParams & {
    riesgoEvaluacionActual: { id: string; contextoId: string; probabilidad: number; impacto: number } | null;
    controlPrincipalTipo: string | null;
    usuarioId: string;
    comentario: string;
  }
): Promise<TratamientoConRelaciones> {
  const nuevoEstadoRiesgo =
    params.estado === "EN_EJECUCION" ? "MONITOREADO" : params.estado === "COMPLETADO" ? "CERRADO" : "TRATADO";

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const residual =
      params.estado === "COMPLETADO"
        ? await calcularNivelResidual(
            tx,
            { evaluacionActual: params.riesgoEvaluacionActual },
            params.estrategia,
            params.controlPrincipalTipo
          )
        : null;

    await transicionarEstadoRiesgo(tx, {
      riesgoId: params.riesgoId,
      usuarioId: params.usuarioId,
      estadoNuevo: nuevoEstadoRiesgo,
      comentario: params.comentario,
    });

    if (residual) {
      await registrarEvaluacionResidualSiAplica(tx, {
        riesgoId: params.riesgoId,
        usuarioId: params.usuarioId,
        residual,
      });
    }

    const tratamiento = await tx.tratamiento.create({
      data: {
        riesgoId: params.riesgoId,
        evaluacionOrigenId: params.evaluacionOrigenId,
        estrategia: params.estrategia,
        descripcionPlan: params.descripcionPlan,
        usuarioResponsableId: params.usuarioResponsableId,
        fechaInicio: params.fechaInicio,
        justificacion: params.justificacion,
        aprobadoPorId: params.aprobadoPorId,
        fechaAprobacion: params.fechaAprobacion,
        fechaLimite: params.fechaLimite,
        estado: params.estado,
        porcentajeAvance: params.porcentajeAvance,
      },
    });

    if (params.controlIds.length > 0) {
      await tx.tratamientoControl.createMany({
        data: params.controlIds.map((controlId) => ({
          tratamientoId: tratamiento.id,
          controlId,
          esPrincipal: controlId === params.controlPrincipalId,
        })),
      });
    }

    return shapeTratamiento(
      await tx.tratamiento.findUniqueOrThrow({
        where: { id: tratamiento.id },
        include: TRATAMIENTO_INCLUDE,
      })
    );
  });
}

export async function actualizarTratamiento(
  id: string,
  params: ActualizarTratamientoParams,
  contexto: {
    riesgoId: string;
    riesgoEvaluacionActual: { id: string; contextoId: string; probabilidad: number; impacto: number } | null;
    estrategiaFinal: string;
    controlPrincipalTipoFinal: string | null;
    controlPrincipalIdFinal: string | null;
    usuarioId: string;
    comentario?: string;
  }
): Promise<TratamientoConRelaciones> {
  const nuevoEstadoRiesgo =
    params.estado === "EN_EJECUCION" ? "MONITOREADO" : params.estado === "COMPLETADO" ? "CERRADO" : null;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (nuevoEstadoRiesgo) {
      const residual =
        params.estado === "COMPLETADO"
          ? await calcularNivelResidual(
              tx,
              { evaluacionActual: contexto.riesgoEvaluacionActual },
              contexto.estrategiaFinal,
              contexto.controlPrincipalTipoFinal
            )
          : null;

      await transicionarEstadoRiesgo(tx, {
        riesgoId: contexto.riesgoId,
        usuarioId: contexto.usuarioId,
        estadoNuevo: nuevoEstadoRiesgo,
        comentario: contexto.comentario,
      });

      if (residual) {
        await registrarEvaluacionResidualSiAplica(tx, {
          riesgoId: contexto.riesgoId,
          usuarioId: contexto.usuarioId,
          residual,
        });
      }
    }

    const { controlIds, controlPrincipalId, ...datosTratamiento } = params;

    await tx.tratamiento.update({
      where: { id },
      data: datosTratamiento,
    });

    if (controlIds !== undefined) {
      await tx.tratamientoControl.deleteMany({ where: { tratamientoId: id } });
      if (controlIds.length > 0) {
        await tx.tratamientoControl.createMany({
          data: controlIds.map((controlId) => ({
            tratamientoId: id,
            controlId,
            esPrincipal: controlId === contexto.controlPrincipalIdFinal,
          })),
        });
      }
    } else if (controlPrincipalId !== undefined) {
      // Solo cambia la bandera esPrincipal sin tocar el conjunto de controles.
      await tx.tratamientoControl.updateMany({
        where: { tratamientoId: id },
        data: { esPrincipal: false },
      });
      if (controlPrincipalId) {
        await tx.tratamientoControl.update({
          where: { tratamientoId_controlId: { tratamientoId: id, controlId: controlPrincipalId } },
          data: { esPrincipal: true },
        });
      }
    }

    return shapeTratamiento(
      await tx.tratamiento.findUniqueOrThrow({
        where: { id },
        include: TRATAMIENTO_INCLUDE,
      })
    );
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
