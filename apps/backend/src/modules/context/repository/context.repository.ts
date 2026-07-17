import { prisma } from "../../../config/prisma";
import {
  Contexto,
  ContextoConDetalle,
  CrearContextoParams,
  ActualizarContextoParams,
  EscalaItemParams,
  MatrizCeldaParams,
  RegistrarAuditoriaParams,
} from "../types/context.types";

const INCLUDE_DETALLE = {
  escalasImpacto: true,
  escalasProbabilidad: true,
   matricesRiesgo: true,
} as const;

export async function findContextosPorOrganizacion(organizacionId: string): Promise<Contexto[]> {
  return prisma.contexto.findMany({
    where: { organizacionId },
    orderBy: { creadoEn: "desc" },
  });
}

export async function findContextoPorIdYOrganizacion(
  id: string,
  organizacionId: string
): Promise<ContextoConDetalle | null> {
  return prisma.contexto.findFirst({
    where: { id, organizacionId },
    include: INCLUDE_DETALLE,
  });
}

export async function findContextoActivoPorOrganizacion(
  organizacionId: string
): Promise<ContextoConDetalle | null> {
  return prisma.contexto.findFirst({
    where: { organizacionId, activo: true },
    include: INCLUDE_DETALLE,
  });
}

export async function crearContexto(params: CrearContextoParams): Promise<Contexto> {
  return prisma.contexto.create({
    data: {
      organizacionId: params.organizacionId,
      alcance: params.alcance,
      criteriosAceptacion: params.criteriosAceptacion,
      activo: false,
    },
  });
}

export async function actualizarContexto(
  id: string,
  params: ActualizarContextoParams
): Promise<Contexto> {
  return prisma.contexto.update({ where: { id }, data: params });
}

export async function contarEscalasImpacto(contextoId: string): Promise<number> {
  return prisma.escalaImpacto.count({ where: { contextoId } });
}

export async function contarEscalasProbabilidad(contextoId: string): Promise<number> {
  return prisma.escalaProbabilidad.count({ where: { contextoId } });
}

export async function contarMatriz(contextoId: string): Promise<number> {
  return prisma.matrizRiesgo.count({ where: { contextoId } });
}


export async function reemplazarEscalasImpacto(
  contextoId: string,
  niveles: EscalaItemParams[]
): Promise<void> {
  await prisma.$transaction([
    prisma.escalaImpacto.deleteMany({ where: { contextoId } }),
    prisma.escalaImpacto.createMany({
      data: niveles.map((n) => ({ contextoId, ...n })),
    }),
  ]);
}

export async function reemplazarEscalasProbabilidad(
  contextoId: string,
  niveles: EscalaItemParams[]
): Promise<void> {
  await prisma.$transaction([
    prisma.escalaProbabilidad.deleteMany({ where: { contextoId } }),
    prisma.escalaProbabilidad.createMany({
      data: niveles.map((n) => ({ contextoId, ...n })),
    }),
  ]);
}

export async function reemplazarMatriz(
  contextoId: string,
  celdas: MatrizCeldaParams[]
): Promise<void> {
  await prisma.$transaction([
    prisma.matrizRiesgo.deleteMany({ where: { contextoId } }),
    prisma.matrizRiesgo.createMany({
      data: celdas.map((c) => ({ contextoId, ...c })),
    }),
  ]);
}


export async function activarContextoTransaccion(
  id: string,
  organizacionId: string
): Promise<Contexto> {
  const [, activado] = await prisma.$transaction([
    prisma.contexto.updateMany({
      where: { organizacionId, activo: true },
      data: { activo: false },
    }),
    prisma.contexto.update({ where: { id }, data: { activo: true } }),
  ]);
  return activado;
}

export async function registrarAuditoria(params: RegistrarAuditoriaParams): Promise<void> {
  await prisma.auditoria.create({
    data: {
      usuarioId: params.usuarioId,
      organizacionId: params.organizacionId,
      entidad: params.entidad,
      entidadId: params.entidadId,
      accion: params.accion,
      datosAnteriores: params.datosAnteriores as never,
      datosNuevos: params.datosNuevos as never,
      direccionIp: params.direccionIp,
    },
  });
}
