import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  RiesgoConRelaciones,
  FiltrosRiesgos,
  CrearRiesgoAavParams,
  CrearRiesgoManualParams,
  ActivoResumen,
  AmenazaResumen,
  VulnerabilidadResumen,
  ContextoActivoResumen,
  CeldaMatrizResumen,
  CategoriaIdentificacionResumen,
  UsuarioDeOrganizacionResumen,
} from "../types/risks.types";
import { RiesgoHistorialEntrada } from "../../history/types/history.types";
import { registrarCreacionRiesgo } from "../../history/service/history.service";
import { findHistorialDeRiesgo as findHistorialDeRiesgoRepo } from "../../history/repository/history.repository";

// Forma canónica en la que el resto del módulo (servicio, controlador,
// mapper hacia el frontend) espera recibir un Riesgo. Se centraliza aquí
// para que toda consulta que devuelva un Riesgo completo lo haga de forma
// idéntica: en particular, el bloque `aav` es lo que permite reconstruir
// el escenario Activo + Amenaza + Vulnerabilidad de un vistazo, sin que
// cada endpoint tenga que volver a decidir qué relaciones incluir. Cuando
// `origen = MANUAL`, `aav` simplemente viene `null` (el riesgo no nació de
// un escenario AAV, sino de un hallazgo reportado directamente).
const RIESGO_INCLUDE = {
  aav: {
    include: {
      activo: { select: { id: true, nombre: true } },
      amenaza: { select: { id: true, nombre: true } },
      vulnerabilidad: { select: { id: true, nombre: true } },
    },
  },
  categoriaIdentificacion: { select: { id: true, nombre: true } },
  creador: { select: { id: true, nombre: true } },
  responsable: { select: { id: true, nombre: true } },
  evaluacionActual: {
    select: {
      id: true,
      tipoEvaluacion: true,
      probabilidad: true,
      impacto: true,
      valorCalculado: true,
      nivelRiesgo: true,
      fechaEvaluacion: true,
    },
  },
} as const;

// V2: Riesgo ya no tiene organizacionId directo ni siempre tiene AAV
// (origen MANUAL). El aislamiento multi-tenant se resuelve por CUALQUIERA
// de las dos cadenas posibles: AAV -> Activo -> Organizacion (origen AAV),
// o creador -> Organizacion (origen MANUAL, ver backfill/creación).
function whereOrganizacion(organizacionId: string) {
  return {
    OR: [
      { aav: { activo: { organizacionId } } },
      { creador: { organizacionId } },
    ],
  };
}

// Listado principal de riesgos de una organización. El riesgo se
// construye a partir de la relación entre un activo, la amenaza que puede
// afectarlo y la vulnerabilidad que puede ser explotada (o, si el origen
// es MANUAL, a partir del hallazgo reportado directamente); esta consulta
// recupera toda la información necesaria para presentar cada riesgo
// conforme al modelo AAV utilizado por ISO/IEC 27005, sin recalcular nada:
// el nivel de riesgo ya vive en la Evaluacion vigente (evaluacionActual),
// nunca se deriva aquí.
export async function findRiesgosDeOrganizacion(
  organizacionId: string,
  filtros: FiltrosRiesgos
): Promise<RiesgoConRelaciones[]> {
  return prisma.riesgo.findMany({
    where: {
      ...whereOrganizacion(organizacionId),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.origen ? { origen: filtros.origen } : {}),
      ...(filtros.responsableId ? { responsableId: filtros.responsableId } : {}),
    },
    include: RIESGO_INCLUDE,
    orderBy: { creadoEn: "desc" },
  });
}

// Detalle de un único riesgo. Misma razón de ser que el listado: trae el
// escenario AAV completo (o los campos MANUAL) más la evaluación vigente,
// para que la pantalla de detalle pueda mostrar de dónde viene el riesgo
// y qué tan grave es hoy sin disparar consultas adicionales.
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
//
// Estas tres consultas son el paso previo obligatorio a construir un
// escenario AAV: antes de crear (o reutilizar) una fila en
// ActivoAmenazaVulnerabilidad, el servicio necesita confirmar que el
// Activo, la Amenaza y la Vulnerabilidad elegidos existen y son visibles
// para la organización del actor. Un Activo siempre pertenece a una única
// organización (findActivoDeOrganizacion exige coincidencia exacta), pero
// Amenaza y Vulnerabilidad pueden ser catálogo global (organizacionId
// NULL) o propio de la organización — por eso sus consultas aceptan
// ambos casos con `OR: [{ organizacionId: null }, { organizacionId }]`.
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

export async function findAmenazaVisible(
  amenazaId: string,
  organizacionId: string
): Promise<AmenazaResumen | null> {
  return prisma.amenaza.findFirst({
    where: { id: amenazaId, OR: [{ organizacionId: null }, { organizacionId }] },
    select: { id: true, organizacionId: true, nombre: true },
  });
}

// V2: la vulnerabilidad ahora también es catálogo global/organización
// (igual que Amenaza) — visible si es global o propia.
export async function findVulnerabilidadVisible(
  vulnerabilidadId: string,
  organizacionId: string
): Promise<VulnerabilidadResumen | null> {
  return prisma.vulnerabilidad.findFirst({
    where: { id: vulnerabilidadId, OR: [{ organizacionId: null }, { organizacionId }] },
    select: { id: true, organizacionId: true, nombre: true },
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

export async function findCategoriaIdentificacion(
  categoriaIdentificacionId: string
): Promise<CategoriaIdentificacionResumen | null> {
  return prisma.categoriaIdentificacionRiesgo.findUnique({
    where: { id: categoriaIdentificacionId },
    select: { id: true, nombre: true },
  });
}

export async function findUsuarioDeOrganizacion(
  usuarioId: string,
  organizacionId: string
): Promise<UsuarioDeOrganizacionResumen | null> {
  return prisma.usuario.findFirst({
    where: { id: usuarioId, organizacionId },
    select: { id: true, organizacionId: true },
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

/**
 * Crea la Evaluacion INHERENTE inicial de un riesgo recién creado y fija
 * Riesgo.evaluacionActualId a esa evaluación — replica, para riesgos
 * nuevos, el mismo backfill que la migración V2 aplicó a los riesgos
 * existentes (ver migración `..._v2_riesgo_evaluacion_tratamiento_polimorficos`).
 *
 * Este paso es el que convierte un escenario AAV (o un hallazgo MANUAL) en
 * un riesgo cuantificado: hasta este punto solo existe la relación
 * Activo+Amenaza+Vulnerabilidad (o el título/descripción del hallazgo
 * manual); recién aquí se calcula probabilidad × impacto y se decide si
 * el resultado es ACEPTABLE o NO_ACEPTABLE (BAJO/MEDIO -> ACEPTABLE,
 * ALTO/CRITICO -> NO_ACEPTABLE), que es lo que más adelante determina si
 * el riesgo necesitará un Tratamiento.
 */
async function crearEvaluacionInherenteYFijarActual(
  tx: Prisma.TransactionClient,
  params: {
    riesgoId: string;
    contextoId: string;
    probabilidad: number;
    impacto: number;
    valorCalculado: number;
    nivelRiesgo: string;
    usuarioId: string;
  }
): Promise<void> {
  const resultado = params.nivelRiesgo === "BAJO" || params.nivelRiesgo === "MEDIO"
    ? "ACEPTABLE"
    : "NO_ACEPTABLE";

  const evaluacion = await tx.evaluacion.create({
    data: {
      riesgoId: params.riesgoId,
      contextoId: params.contextoId,
      tipoEvaluacion: "INHERENTE",
      probabilidad: params.probabilidad,
      impacto: params.impacto,
      valorCalculado: params.valorCalculado,
      nivelRiesgo: params.nivelRiesgo as never,
      resultado: resultado as never,
      justificacion: "Evaluación inherente generada automáticamente al identificar el riesgo.",
      usuarioId: params.usuarioId,
    },
  });

  await tx.riesgo.update({
    where: { id: params.riesgoId },
    data: { evaluacionActualId: evaluacion.id },
  });
}

/**
 * Punto de entrada donde el modelo AAV se materializa en la base de datos.
 *
 * Un riesgo de origen AAV no puede existir sin su escenario
 * Activo+Amenaza+Vulnerabilidad, así que esta función hace, en una sola
 * transacción, exactamente los pasos que el modelo conceptual describe:
 *
 *   1. Busca si ya existe una fila ActivoAmenazaVulnerabilidad para esta
 *      combinación exacta de activoId+amenazaId+vulnerabilidadId. Como un
 *      mismo Activo puede tener varias Amenazas, una misma Amenaza puede
 *      afectar varios Activos, y una misma Vulnerabilidad puede ser
 *      explotada por varias Amenazas, la única forma de saber si "este
 *      escenario ya se identificó antes" es buscar por la combinación
 *      completa de los tres, no por cada entidad por separado.
 *   2. Si no existe, la crea — este es el único lugar del sistema donde
 *      nace una fila AAV; no hay un endpoint para crearla de forma
 *      aislada (ver comentario en el modelo ActivoAmenazaVulnerabilidad).
 *   3. Verifica que ese AAV no tenga ya un Riesgo asociado: la relación
 *      Riesgo.aavId es @unique porque un mismo escenario AAV representa un
 *      único riesgo — si ya fue identificado, no se duplica (se lanza
 *      RiesgoDuplicadoParaAavError).
 *   4. Crea el Riesgo apuntando a ese AAV (origen: "AAV").
 *   5. Delega en crearEvaluacionInherenteYFijarActual el cálculo real del
 *      riesgo (probabilidad × impacto), que requiere el Contexto ISO
 *      activo de la organización — sin un contexto activo no hay matriz
 *      de riesgo contra la cual evaluar, así que la operación completa
 *      falla si no existe uno.
 *   6. Dejar auditoría (Auditoria) e historial de estado (RiesgoHistorial)
 *      del riesgo recién creado.
 *
 * El reintento (`intentosRestantes`) existe porque el paso 1 y el paso 2
 * no son atómicos entre sí frente a otra request concurrente: si dos
 * peticiones intentan crear el mismo escenario AAV al mismo tiempo, la
 * restricción @@unique([activoId, amenazaId, vulnerabilidadId]) hará que
 * una de las dos falle con P2002; en ese caso se reintenta toda la
 * transacción, que en el segundo intento sí encontrará la fila ya creada
 * por la otra petición.
 */
export async function crearAavYRiesgo(
  params: CrearRiesgoAavParams,
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

      const valorCalculado = params.probabilidad * params.impacto;

      const riesgoCreado = await tx.riesgo.create({
        data: {
          origen: "AAV",
          aavId: aav.id,
          descripcion: params.descripcion,
          creadorId: params.actor.usuarioId,
          responsableId: params.responsableId,
          estado: "IDENTIFICADO",
        },
      });

      const contexto = await tx.contexto.findFirst({
        where: { organizacionId: params.organizacionId, activo: true },
        select: { id: true },
      });
      if (!contexto) {
        throw new Error(
          "No es posible crear la evaluación inherente: la organización no tiene un Contexto ISO activo"
        );
      }

      await crearEvaluacionInherenteYFijarActual(tx, {
        riesgoId: riesgoCreado.id,
        contextoId: contexto.id,
        probabilidad: params.probabilidad,
        impacto: params.impacto,
        valorCalculado,
        nivelRiesgo: params.nivelRiesgoInherente,
        usuarioId: params.actor.usuarioId,
      });

      await tx.auditoria.create({
        data: {
          usuarioId: params.actor.usuarioId,
          organizacionId: params.organizacionId,
          entidad: "Riesgo",
          entidadId: riesgoCreado.id,
          accion: "CREAR",
          datosNuevos: {
            origen: "AAV",
            activoId: params.activoId,
            amenazaId: params.amenazaId,
            vulnerabilidadId: params.vulnerabilidadId,
            descripcion: params.descripcion,
            probabilidad: params.probabilidad,
            impacto: params.impacto,
            valorCalculado,
            nivelRiesgoInherente: params.nivelRiesgoInherente,
            responsableId: params.responsableId,
          } as never,
          direccionIp: params.actor.direccionIp,
        },
      });

      await registrarCreacionRiesgo(tx, {
        riesgoId: riesgoCreado.id,
        usuarioId: params.actor.usuarioId,
        estadoInicial: "IDENTIFICADO",
      });

      return tx.riesgo.findUniqueOrThrow({
        where: { id: riesgoCreado.id },
        include: RIESGO_INCLUDE,
      });
    });
  } catch (err) {
    if (esViolacionDeUnicidad(err) && intentosRestantes > 0) {
      return crearAavYRiesgo(params, intentosRestantes - 1);
    }
    throw err;
  }
}

// V2: creación de riesgo de origen MANUAL (punto 1 del prompt) — sin AAV,
// con titulo/descripcion/justificacionOrigen/categoriaIdentificacionId
// obligatorios (garantizado también por el CHECK `riesgo_origen_check`).
//
// Es el camino alterno a crearAavYRiesgo: cuando un riesgo se identifica
// directamente (por ejemplo, en una auditoría o un reporte externo) y no
// existe todavía un Activo/Amenaza/Vulnerabilidad catalogados para
// describirlo, no tiene sentido forzar la creación de un escenario AAV
// artificial. Por eso este camino omite por completo el paso de
// ActivoAmenazaVulnerabilidad, pero converge con el flujo AAV exactamente
// en el mismo punto: ambos terminan llamando a
// crearEvaluacionInherenteYFijarActual, porque el cálculo del riesgo
// (probabilidad × impacto contra la matriz del Contexto ISO activo) es
// idéntico sin importar de dónde vino el riesgo.
export async function crearRiesgoManual(
  params: CrearRiesgoManualParams
): Promise<RiesgoConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const valorCalculado = params.probabilidad * params.impacto;

    const riesgoCreado = await tx.riesgo.create({
      data: {
        origen: "MANUAL",
        titulo: params.titulo,
        descripcion: params.descripcion,
        justificacionOrigen: params.justificacionOrigen,
        categoriaIdentificacionId: params.categoriaIdentificacionId,
        creadorId: params.actor.usuarioId,
        responsableId: params.responsableId,
        estado: "IDENTIFICADO",
      },
    });

    const contexto = await tx.contexto.findFirst({
      where: { organizacionId: params.organizacionId, activo: true },
      select: { id: true },
    });
    if (!contexto) {
      throw new Error(
        "No es posible crear la evaluación inherente: la organización no tiene un Contexto ISO activo"
      );
    }

    await crearEvaluacionInherenteYFijarActual(tx, {
      riesgoId: riesgoCreado.id,
      contextoId: contexto.id,
      probabilidad: params.probabilidad,
      impacto: params.impacto,
      valorCalculado,
      nivelRiesgo: params.nivelRiesgoInherente,
      usuarioId: params.actor.usuarioId,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: params.actor.usuarioId,
        organizacionId: params.organizacionId,
        entidad: "Riesgo",
        entidadId: riesgoCreado.id,
        accion: "CREAR",
        datosNuevos: {
          origen: "MANUAL",
          titulo: params.titulo,
          categoriaIdentificacionId: params.categoriaIdentificacionId,
          probabilidad: params.probabilidad,
          impacto: params.impacto,
          valorCalculado,
          nivelRiesgoInherente: params.nivelRiesgoInherente,
          responsableId: params.responsableId,
        } as never,
        direccionIp: params.actor.direccionIp,
      },
    });

    await registrarCreacionRiesgo(tx, {
      riesgoId: riesgoCreado.id,
      usuarioId: params.actor.usuarioId,
      estadoInicial: "IDENTIFICADO",
    });

    return tx.riesgo.findUniqueOrThrow({
      where: { id: riesgoCreado.id },
      include: RIESGO_INCLUDE,
    });
  });
}

// V2 (punto 13 del prompt): endpoint dedicado para reasignar responsable.
// creadorId NUNCA se toca aquí.
export async function reasignarResponsableDeRiesgo(params: {
  riesgoId: string;
  responsableIdNuevo: string;
  organizacionId: string;
  actor: { usuarioId: string; direccionIp: string };
}): Promise<RiesgoConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const anterior = await tx.riesgo.findUniqueOrThrow({
      where: { id: params.riesgoId },
      select: { responsableId: true },
    });

    const actualizado = await tx.riesgo.update({
      where: { id: params.riesgoId },
      data: { responsableId: params.responsableIdNuevo },
      include: RIESGO_INCLUDE,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: params.actor.usuarioId,
        organizacionId: params.organizacionId,
        entidad: "Riesgo",
        entidadId: params.riesgoId,
        accion: "EDITAR",
        datosAnteriores: { responsableId: anterior.responsableId } as never,
        datosNuevos: { responsableId: params.responsableIdNuevo } as never,
        direccionIp: params.actor.direccionIp,
      },
    });

    return actualizado;
  });
}

// ---------------------------------------------------------------------------
// Historial. Aislamiento multi-tenant: se exige que el riesgo pertenezca a
// la organización antes de listar su historial (mismo criterio que
// findRiesgoDeOrganizacionPorId).
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
