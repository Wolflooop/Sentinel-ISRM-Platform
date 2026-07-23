import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarCategoriaIdentificacionParams,
  CategoriaIdentificacionRiesgo,
  CrearCategoriaIdentificacionParams,
} from "../types/risk-identification-categories.types";

export async function findCategoriasIdentificacion(): Promise<CategoriaIdentificacionRiesgo[]> {
  return prisma.categoriaIdentificacionRiesgo.findMany({ orderBy: { nombre: "asc" } });
}

export async function findCategoriaIdentificacionPorId(
  id: string
): Promise<CategoriaIdentificacionRiesgo | null> {
  return prisma.categoriaIdentificacionRiesgo.findUnique({ where: { id } });
}

export async function existeOtraCategoriaConNombre(nombre: string, excluirId?: string): Promise<boolean> {
  const existente = await prisma.categoriaIdentificacionRiesgo.findFirst({
    where: { nombre, ...(excluirId ? { id: { not: excluirId } } : {}) },
    select: { id: true },
  });
  return existente !== null;
}

export async function existeRiesgoConCategoria(categoriaId: string): Promise<boolean> {
  const riesgo = await prisma.riesgo.findFirst({
    where: { categoriaIdentificacionId: categoriaId },
    select: { id: true },
  });
  return riesgo !== null;
}

export async function crearCategoriaIdentificacionConAuditoria(
  params: CrearCategoriaIdentificacionParams,
  auditoria: { usuarioId: string; organizacionId: string; direccionIp: string }
): Promise<CategoriaIdentificacionRiesgo> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const categoria = await tx.categoriaIdentificacionRiesgo.create({ data: params });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "CategoriaIdentificacionRiesgo",
        entidadId: categoria.id,
        accion: "CREAR",
        datosNuevos: params as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return categoria;
  });
}

export async function actualizarCategoriaIdentificacionConAuditoria(
  id: string,
  params: ActualizarCategoriaIdentificacionParams,
  auditoria: { usuarioId: string; organizacionId: string; direccionIp: string; datosAnteriores: unknown }
): Promise<CategoriaIdentificacionRiesgo> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const categoria = await tx.categoriaIdentificacionRiesgo.update({ where: { id }, data: params });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "CategoriaIdentificacionRiesgo",
        entidadId: id,
        accion: "EDITAR",
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: params as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return categoria;
  });
}

export async function eliminarCategoriaIdentificacionConAuditoria(
  id: string,
  auditoria: { usuarioId: string; organizacionId: string; direccionIp: string; datosAnteriores: unknown }
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.categoriaIdentificacionRiesgo.delete({ where: { id } });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "CategoriaIdentificacionRiesgo",
        entidadId: id,
        accion: "ELIMINAR",
        datosAnteriores: auditoria.datosAnteriores as never,
        direccionIp: auditoria.direccionIp,
      },
    });
  });
}
