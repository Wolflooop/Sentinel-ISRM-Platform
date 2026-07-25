import { prisma } from "../../../config/prisma";
import {
  Contexto,
  ContextoConDetalle,
  CrearContextoParams,
  ActualizarContextoParams,
  EscalaItemParams,
  MatrizCeldaParams,
} from "../types/context.types";
import { registrarAuditoria } from "../../../shared/audit";

interface ActorAuditoriaContexto {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

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

export async function crearContexto(
  params: CrearContextoParams,
  actor: ActorAuditoriaContexto
): Promise<Contexto> {
  return prisma.$transaction(async (tx) => {
    const contexto = await tx.contexto.create({
      data: {
        organizacionId: params.organizacionId,
        alcance: params.alcance,
        criteriosAceptacion: params.criteriosAceptacion,
        activo: false,
      },
    });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: contexto.id,
      accion: "CREAR",
      datosNuevos: { alcance: contexto.alcance, criteriosAceptacion: contexto.criteriosAceptacion },
      direccionIp: actor.direccionIp,
    });

    return contexto;
  });
}

export async function actualizarContexto(
  id: string,
  params: ActualizarContextoParams,
  actor: ActorAuditoriaContexto,
  datosAnteriores: { alcance: string; criteriosAceptacion: string }
): Promise<Contexto> {
  return prisma.$transaction(async (tx) => {
    const contexto = await tx.contexto.update({ where: { id }, data: params });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: id,
      accion: "EDITAR",
      datosAnteriores,
      datosNuevos: { alcance: contexto.alcance, criteriosAceptacion: contexto.criteriosAceptacion },
      direccionIp: actor.direccionIp,
    });

    return contexto;
  });
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
  niveles: EscalaItemParams[],
  actor: ActorAuditoriaContexto
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.escalaImpacto.deleteMany({ where: { contextoId } });
    await tx.escalaImpacto.createMany({
      data: niveles.map((n) => ({ contextoId, ...n })),
    });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: contextoId,
      accion: "EDITAR",
      datosNuevos: { escalasImpacto: niveles },
      direccionIp: actor.direccionIp,
    });
  });
}

export async function reemplazarEscalasProbabilidad(
  contextoId: string,
  niveles: EscalaItemParams[],
  actor: ActorAuditoriaContexto
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.escalaProbabilidad.deleteMany({ where: { contextoId } });
    await tx.escalaProbabilidad.createMany({
      data: niveles.map((n) => ({ contextoId, ...n })),
    });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: contextoId,
      accion: "EDITAR",
      datosNuevos: { escalasProbabilidad: niveles },
      direccionIp: actor.direccionIp,
    });
  });
}

export async function reemplazarMatriz(
  contextoId: string,
  celdas: MatrizCeldaParams[],
  actor: ActorAuditoriaContexto
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.matrizRiesgo.deleteMany({ where: { contextoId } });
    await tx.matrizRiesgo.createMany({
      data: celdas.map((c) => ({ contextoId, ...c })),
    });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: contextoId,
      accion: "EDITAR",
      datosNuevos: { matriz: celdas },
      direccionIp: actor.direccionIp,
    });
  });
}


export async function activarContextoTransaccion(
  id: string,
  organizacionId: string,
  actor: ActorAuditoriaContexto
): Promise<Contexto> {
  return prisma.$transaction(async (tx) => {
    await tx.contexto.updateMany({
      where: { organizacionId, activo: true },
      data: { activo: false },
    });
    const activado = await tx.contexto.update({ where: { id }, data: { activo: true } });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Contexto",
      entidadId: id,
      accion: "APROBAR",
      datosAnteriores: { activo: false },
      datosNuevos: { activo: true },
      direccionIp: actor.direccionIp,
    });

    return activado;
  });
}

