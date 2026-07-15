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

export async function crearReporte(
  params: CrearReporteParams
): Promise<ReporteConRelaciones> {
  return prisma.reporte.create({
    data: {
      organizacionId: params.organizacionId,
      usuarioId: params.usuarioId,
      tipo: params.tipo,
      formato: params.formato,
      rutaArchivo: params.rutaArchivo,
    },
    include: REPORTE_INCLUDE,
  });
}

/**
 * Ensambla los datos de solo lectura necesarios para construir el
 * contenido de un reporte, reutilizando las relaciones ya modeladas por
 * los módulos existentes (activos, riesgos, controles, contexto). No
 * duplica reglas de negocio de esos módulos: solo lee.
 */
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
        where: { aav: { activo: { organizacionId } } },
        select: {
          probabilidad: true,
          impacto: true,
          valorRiesgo: true,
          nivelRiesgoInherente: true,
          nivelRiesgoResidual: true,
          aav: {
            select: {
              activo: { select: { nombre: true } },
              amenaza: { select: { nombre: true } },
              vulnerabilidad: { select: { nombre: true } },
            },
          },
        },
        orderBy: { valorRiesgo: "desc" },
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
    riesgos: riesgos.map((r: (typeof riesgos)[number]) => ({
      activo: r.aav.activo.nombre,
      amenaza: r.aav.amenaza.nombre,
      vulnerabilidad: r.aav.vulnerabilidad.nombre,
      probabilidad: r.probabilidad,
      impacto: r.impacto,
      valorRiesgo: r.valorRiesgo,
      nivelInherente: r.nivelRiesgoInherente,
      nivelResidual: r.nivelRiesgoResidual,
    })),
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

export async function registrarAuditoriaReporte(params: {
  usuarioId: string;
  organizacionId: string;
  entidadId: string;
  direccionIp: string;
  datosNuevos?: unknown;
}): Promise<void> {
  await prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: "Reporte",
      entidadId: params.entidadId,
      accion: "CREAR",
      datosNuevos: params.datosNuevos as never,
      direccionIp: params.direccionIp,
    },
  });
}
