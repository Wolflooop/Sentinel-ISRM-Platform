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

/**
 * `ActivoAmenazaVulnerabilidad` (AAV) se maneja EXCLUSIVAMENTE dentro de
 * este archivo, nunca se expone como recurso propio (routes/controller/dto)
 * — es un detalle interno de la creación de un Riesgo (ver PASO 1 de esta
 * fase). Ningún otro módulo importa `prisma.activoAmenazaVulnerabilidad`.
 */

const RIESGO_INCLUDE = {
  aav: {
    include: {
      activo: { select: { id: true, nombre: true } },
      amenaza: { select: { id: true, nombre: true } },
      vulnerabilidad: { select: { id: true, nombre: true } },
    },
  },
} as const;

/**
 * Riesgo no tiene `organizacionId` directo (Decisión Fase 8.1 / schema.prisma:
 * el aislamiento multi-tenant se resuelve vía JOIN Riesgo -> AAV -> Activo
 * -> Organizacion). Este filtro se reutiliza en list/detail.
 */
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

/**
 * Señal de dominio para "ya existe un Riesgo para este AAV" (relación 1:1,
 * Fase 4 §4.4). Deliberadamente SIN propiedad `.status`: el Repository no
 * decide semántica HTTP — es el Service quien atrapa esta clase y la
 * traduce a `AppError(409, ...)`, igual que en el resto de módulos del
 * proyecto (corrección de auditoría: antes se lanzaba un `Error` genérico
 * con `.status` inyectado por type assertion, mezclando una decisión HTTP
 * dentro de la capa de Prisma).
 */
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

/**
 * Flujo obligatorio (ver encabezado de la Fase 9):
 *   BEGIN TRANSACTION
 *   → buscar AAV existente
 *   → si no existe, crearlo
 *   → crear Riesgo (1:1 con AAV, aavId es @unique)
 *   → COMMIT
 *
 * Manejo de concurrencia: si dos peticiones intentan crear el mismo AAV en
 * paralelo, la segunda `create` viola `@@unique([activoId, amenazaId,
 * vulnerabilidadId])` (P2002). En PostgreSQL, una vez que una sentencia
 * dentro de una transacción falla, esa transacción completa queda abortada
 * — no es válido "atrapar el error y seguir consultando" dentro de la MISMA
 * transacción. Por eso la estrategia correcta es reintentar la
 * TRANSACCIÓN COMPLETA (no solo el create): en el reintento, el
 * `findUnique` inicial encontrará el AAV que la otra petición ya confirmó,
 * y se continúa normalmente. Lo mismo cubre una segunda fuente de carrera:
 * dos peticiones que reutilizan el mismo AAV e intentan crear su Riesgo
 * (1:1, `aavId` único) al mismo tiempo.
 */
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
        // No es una condición de carrera transitoria en sí misma — es un
        // conflicto de negocio real (AAV -> Riesgo es 1:1, Fase 4 §4.4).
        // Nota: si dos peticiones concurrentes llegan hasta aquí a la vez,
        // la segunda `tx.riesgo.create` de abajo también violaría el
        // `@unique` físico de `Riesgo.aavId` (P2002) y activaría el reintento
        // completo de la transacción; en ese reintento, este mismo chequeo
        // encontrará el riesgo ya creado y lanzará este error de negocio
        // (no un P2002), terminando el reintento de forma natural.
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

      // Corrección de auditoría: el flujo obligatorio de la Fase 9 es
      // "crear Riesgo → registrar Auditoría → COMMIT" — ambas escrituras
      // deben quedar dentro de la MISMA transacción (`tx`, no `prisma`),
      // para que un Riesgo nunca pueda quedar persistido sin su registro
      // de auditoría correspondiente.
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

      return riesgoCreado;
    });
  } catch (err) {
    if (esViolacionDeUnicidad(err) && intentosRestantes > 0) {
      return crearAavYRiesgo(params, intentosRestantes - 1);
    }
    throw err;
  }
}
