import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  CrearReporteParams,
  DatosReporteOrganizacion,
  FiltrosReportes,
  ReporteConRelaciones,
} from "../types/reports.types";

const REPORTE_INCLUDE = {
  usuario: {
    select: { id: true, nombre: true },
  },
} as const;

export async function findReportes(
  filtros: FiltrosReportes
): Promise<ReporteConRelaciones[]> {
  return prisma.reporte.findMany({
    where: {
      organizacionId: filtros.organizacionId,
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    },
    include: REPORTE_INCLUDE,
    orderBy: { fecha: "desc" },
  });
}

export async function findReportePorId(
  id: string
): Promise<ReporteConRelaciones | null> {
  return prisma.reporte.findUnique({
    where: { id },
    include: REPORTE_INCLUDE,
  });
}


export async function crearReporteConAuditoria(
  params: CrearReporteParams,
  auditoria: {
    usuarioId: string;
    organizacionId: string;
    direccionIp: string;
    datosNuevos?: unknown;
  }
): Promise<ReporteConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const reporte = await tx.reporte.create({
      data: {
        organizacionId: params.organizacionId,
        usuarioId: params.usuarioId,
        tipo: params.tipo,
        formato: params.formato,
        rutaArchivo: params.rutaArchivo,
      },
      include: REPORTE_INCLUDE,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Reporte",
        entidadId: reporte.id,
        accion: "CREAR",
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return reporte;
  });
}


export async function recopilarDatosOrganizacion(
  organizacionId: string
): Promise<DatosReporteOrganizacion> {
  const [organizacion, activos, riesgos, controles, contextoActivo] =
    await Promise.all([
      prisma.organizacion.findUnique({
        where: { id: organizacionId },
        select: { nombre: true, sector: true, tamano: true, paisIso: true },
      }),
      prisma.activo.findMany({
        where: { organizacionId },
        select: {
          nombre: true,
          criticidad: true,
          estado: true,
          categoria: { select: { nombre: true } },
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.riesgo.findMany({
        where: {
          OR: [
            { aav: { activo: { organizacionId } } },
            { creador: { organizacionId } },
          ],
        },
        select: {
          origen: true,
          titulo: true,
          evaluacionActual: {
            select: { probabilidad: true, impacto: true, valorCalculado: true, nivelRiesgo: true, tipoEvaluacion: true },
          },
          evaluaciones: {
            where: { tipoEvaluacion: "INHERENTE" },
            select: { nivelRiesgo: true },
            take: 1,
          },
          aav: {
            select: {
              activo: { select: { nombre: true } },
              amenaza: { select: { nombre: true } },
              vulnerabilidad: { select: { nombre: true } },
            },
          },
        },
      }),
      prisma.control.findMany({
        where: { OR: [{ organizacionId }, { organizacionId: null }] },
        select: {
          nombre: true,
          tipo: true,
          estadoImplementacion: true,
          codigoIso27001: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.contexto.findFirst({
        where: { organizacionId, activo: true },
        select: {
          matricesRiesgo: {
            select: {
              nivelProbabilidad: true,
              nivelImpacto: true,
              nivelResultante: true,
            },
          },
        },
      }),
    ]);

  if (!organizacion) {
    return {
      organizacion: { nombre: "", sector: "", tamano: "", paisIso: "" },
      activos: [],
      riesgos: [],
      controles: [],
      matriz: null,
      generadoEn: new Date(),
    };
  }

  return {
    organizacion,
    activos: activos.map((a: (typeof activos)[number]) => ({
      nombre: a.nombre,
      categoria: a.categoria.nombre,
      criticidad: a.criticidad,
      estado: a.estado,
    })),
    riesgos: riesgos
      .map((r: (typeof riesgos)[number]) => ({
        activo: r.origen === "AAV" && r.aav ? r.aav.activo.nombre : (r.titulo ?? "Riesgo manual"),
        amenaza: r.origen === "AAV" && r.aav ? r.aav.amenaza.nombre : null,
        vulnerabilidad: r.origen === "AAV" && r.aav ? r.aav.vulnerabilidad.nombre : null,
        probabilidad: r.evaluacionActual?.probabilidad ?? 0,
        impacto: r.evaluacionActual?.impacto ?? 0,
        valorRiesgo: r.evaluacionActual?.valorCalculado ?? 0,
        nivelInherente: r.evaluaciones[0]?.nivelRiesgo ?? r.evaluacionActual?.nivelRiesgo ?? "BAJO",
        nivelResidual: r.evaluacionActual?.tipoEvaluacion === "RESIDUAL" ? r.evaluacionActual.nivelRiesgo : null,
      }))
      .sort((a, b) => b.valorRiesgo - a.valorRiesgo),
    controles: controles.map((c: (typeof controles)[number]) => ({
      nombre: c.nombre,
      tipo: c.tipo,
      estadoImplementacion: c.estadoImplementacion,
      codigoIso27001: c.codigoIso27001,
    })),
    matriz: contextoActivo
      ? {
          celdas: contextoActivo.matricesRiesgo.map(
            (m: (typeof contextoActivo.matricesRiesgo)[number]) => ({
              probabilidad: m.nivelProbabilidad,
              impacto: m.nivelImpacto,
              nivel: m.nivelResultante,
            })
          ),
        }
      : null,
    generadoEn: new Date(),
  };
}

