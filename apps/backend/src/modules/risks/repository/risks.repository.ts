import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  RiesgoConRelaciones,
  FiltrosRiesgos,
  CrearRiesgoParams,
  ActivoResumen,
  AmenazaResumen,
  VulnerabilidadResumen,
  ContextoActivoResumen,
  CeldaMatrizResumen,
} from "../types/risks.types";
import { RiesgoHistorialEntrada } from "../../history/types/history.types";
import { registrarCreacionRiesgo } from "../../history/service/history.service";
import { findHistorialDeRiesgo as findHistorialDeRiesgoRepo } from "../../history/repository/history.repository";



const RIESGO_INCLUDE = {
  aav: {
    include: {
      activo: { select: { id: true, nombre: true } },
      amenaza: { select: { id: true, nombre: true } },
      vulnerabilidad: { select: { id: true, nombre: true } },
    },
  },
} as const;


function whereOrganizacion(organizacionId: string) {
  return { aav: { activo: { organizacionId } } };
}

export async function findRiesgosDeOrganizacion(
  organizacionId: string,
  filtros: FiltrosRiesgos
): Promise<RiesgoConRelaciones[]> {
  return prisma.riesgo.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.nivelRiesgoInherente
        ? { nivelRiesgoInherente: filtros.nivelRiesgoInherente }
        : {}),
    },
    include: RIESGO_INCLUDE,
    orderBy: { creadoEn: "desc" },
  });
}

export async function findRiesgoDeOrganizacionPorId(
  id: string,
  organizacionId: string
): Promise<RiesgoConRelaciones | null> {
  return prisma.riesgo.findFirst({
    where: { id, ...whereOrganizacion(organizacionId) },
    include: RIESGO_INCLUDE,
  });
}

// ---------------------------------------------------------------------------
// Validaciones de existencia/pertenencia (lectura simple, sin lógica de
// negocio — la lógica vive en risks.service.ts)
// ---------------------------------------------------------------------------

export async function findActivoDeOrganizacion(
  activoId: string,
  organizacionId: string
): Promise<ActivoResumen | null> {
  return prisma.activo.findFirst({
    where: { id: activoId, organizacionId },
    select: { id: true, organizacionId: true, nombre: true, estado: true },
  });
}

/**
 * Igual que en threats.repository.ts: visible tanto si es global
 * (`organizacionId = null`) como si es propia de la organización.
 */
export async function findAmenazaVisible(
  amenazaId: string,
  organizacionId: string
): Promise<AmenazaResumen | null> {
  return prisma.amenaza.findFirst({
    where: { id: amenazaId, OR: [{ organizacionId: null }, { organizacionId }] },
    select: { id: true, organizacionId: true, nombre: true },
  });
}

/** Vulnerabilidad es 100% global (sin organizacionId) — solo existencia. */
export async function findVulnerabilidad(
  vulnerabilidadId: string
): Promise<VulnerabilidadResumen | null> {
  return prisma.vulnerabilidad.findUnique({
    where: { id: vulnerabilidadId },
    select: { id: true, nombre: true },
  });
}

export async function findContextoActivoDeOrganizacion(
  organizacionId: string
): Promise<ContextoActivoResumen | null> {
  return prisma.contexto.findFirst({
    where: { organizacionId, activo: true },
    select: { id: true, organizacionId: true },
  });
}

export async function findCeldaMatriz(
  contextoId: string,
  nivelProbabilidad: number,
  nivelImpacto: number
): Promise<CeldaMatrizResumen | null> {
  return prisma.matrizRiesgo.findUnique({
    where: {
      contextoId_nivelProbabilidad_nivelImpacto: {
        contextoId,
        nivelProbabilidad,
        nivelImpacto,
      },
    },
    select: { nivelResultante: true },
  });
}


export class RiesgoDuplicadoParaAavError extends Error {
  constructor() {
    super(
      "Ya existe un riesgo registrado para esta combinación de activo, amenaza y vulnerabilidad"
    );
    this.name = "RiesgoDuplicadoParaAavError";
  }
}

function esViolacionDeUnicidad(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}


export async function crearAavYRiesgo(
  params: CrearRiesgoParams,
  intentosRestantes = 3
): Promise<RiesgoConRelaciones> {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let aav = await tx.activoAmenazaVulnerabilidad.findUnique({
        where: {
          activoId_amenazaId_vulnerabilidadId: {
            activoId: params.activoId,
            amenazaId: params.amenazaId,
            vulnerabilidadId: params.vulnerabilidadId,
          },
        },
      });

      if (!aav) {
        aav = await tx.activoAmenazaVulnerabilidad.create({
          data: {
            activoId: params.activoId,
            amenazaId: params.amenazaId,
            vulnerabilidadId: params.vulnerabilidadId,
          },
        });
      }

      const riesgoExistente = await tx.riesgo.findUnique({ where: { aavId: aav.id } });
      if (riesgoExistente) {

        throw new RiesgoDuplicadoParaAavError();
      }

      const valorRiesgo = params.probabilidad * params.impacto;

      const riesgoCreado = await tx.riesgo.create({
        data: {
          aavId: aav.id,
          probabilidad: params.probabilidad,
          impacto: params.impacto,
          valorRiesgo,
          nivelRiesgoInherente: params.nivelRiesgoInherente,
          estado: "IDENTIFICADO",
        },
        include: RIESGO_INCLUDE,
      });

      await tx.auditoria.create({
        data: {
          usuarioId: params.actor.usuarioId,
          organizacionId: params.organizacionId,
          entidad: "Riesgo",
          entidadId: riesgoCreado.id,
          accion: "CREAR",
          datosNuevos: {
            activoId: params.activoId,
            amenazaId: params.amenazaId,
            vulnerabilidadId: params.vulnerabilidadId,
            probabilidad: params.probabilidad,
            impacto: params.impacto,
            valorRiesgo,
            nivelRiesgoInherente: params.nivelRiesgoInherente,
          } as never,
          direccionIp: params.actor.direccionIp,
        },
      });

      // Primera entrada del historial: único punto responsable, ver
      // modules/history/service/history.service.ts.
      await registrarCreacionRiesgo(tx, {
        riesgoId: riesgoCreado.id,
        usuarioId: params.actor.usuarioId,
        estadoInicial: "IDENTIFICADO",
      });

      return riesgoCreado;
    });
  } catch (err) {
    if (esViolacionDeUnicidad(err) && intentosRestantes > 0) {
      return crearAavYRiesgo(params, intentosRestantes - 1);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Historial. Aislamiento multi-tenant: se exige que el riesgo pertenezca a
// la organización antes de listar su historial (mismo criterio que
// findRiesgoDeOrganizacionPorId). La lectura/escritura del historial en sí
// vive en modules/history/repository — este módulo solo valida pertenencia.
// ---------------------------------------------------------------------------

export async function findHistorialDeRiesgo(
  riesgoId: string,
  organizacionId: string
): Promise<RiesgoHistorialEntrada[]> {
  const riesgo = await prisma.riesgo.findFirst({
    where: { id: riesgoId, ...whereOrganizacion(organizacionId) },
    select: { id: true },
  });
  if (!riesgo) {
    return [];
  }

  return findHistorialDeRiesgoRepo(riesgoId);
}
