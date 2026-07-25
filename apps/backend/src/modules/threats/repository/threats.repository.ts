import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  AmenazaConRelaciones,
  CategoriaAmenaza,
  FiltrosAmenazas,
  CrearAmenazaParams,
  ActualizarAmenazaParams,
} from "../types/threats.types";
import { registrarAuditoria, RegistrarAuditoriaParams } from "../../../shared/audit";

const INCLUDE_RELACIONES = {
  categoria: { select: { id: true, nombre: true } },
} as const;


export async function findAmenazasVisiblesParaOrganizacion(
  organizacionId: string,
  filtros: FiltrosAmenazas
): Promise<AmenazaConRelaciones[]> {
  return prisma.amenaza.findMany({
    where: {
      OR: [{ organizacionId: null }, { organizacionId }],
      ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
      ...(filtros.origen ? { origen: filtros.origen } : {}),
      ...(filtros.busqueda
        ? { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } }
        : {}),
    },
    include: INCLUDE_RELACIONES,
    orderBy: { nombre: "asc" },
  });
}

export async function findAmenazaVisiblePorId(
  id: string,
  organizacionId: string
): Promise<AmenazaConRelaciones | null> {
  return prisma.amenaza.findFirst({
    where: { id, OR: [{ organizacionId: null }, { organizacionId }] },
    include: INCLUDE_RELACIONES,
  });
}


export async function existeOtraAmenazaConNombreEnOrganizacion(
  organizacionId: string,
  nombre: string,
  excluirId?: string
): Promise<boolean> {
  const existente = await prisma.amenaza.findFirst({
    where: {
      organizacionId,
      nombre,
      ...(excluirId ? { id: { not: excluirId } } : {}),
    },
    select: { id: true },
  });
  return existente !== null;
}

export async function existeCategoriaAmenaza(categoriaId: string): Promise<boolean> {
  const categoria = await prisma.categoriaAmenaza.findUnique({
    where: { id: categoriaId },
    select: { id: true },
  });
  return categoria !== null;
}

export async function findCategoriasAmenaza(): Promise<CategoriaAmenaza[]> {
  return prisma.categoriaAmenaza.findMany({ orderBy: { nombre: "asc" } });
}


export async function existeAavParaAmenaza(amenazaId: string): Promise<boolean> {
  const aav = await prisma.activoAmenazaVulnerabilidad.findFirst({
    where: { amenazaId },
    select: { id: true },
  });
  return aav !== null;
}


export async function crearAmenazaConAuditoria(
  params: CrearAmenazaParams,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<AmenazaConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const amenaza = await tx.amenaza.create({
      data: {
        organizacionId: params.organizacionId,
        categoriaId: params.categoriaId,
        nombre: params.nombre,
        descripcion: params.descripcion,
        origen: params.origen,
        esPredefinida: false,
      },
      include: INCLUDE_RELACIONES,
    });

    await registrarAuditoria(tx, {
      usuarioId: auditoria.usuarioId,
      organizacionId: auditoria.organizacionId,
      entidad: "Amenaza",
      entidadId: amenaza.id,
      accion: auditoria.accion,
      datosAnteriores: auditoria.datosAnteriores,
      datosNuevos: auditoria.datosNuevos,
      direccionIp: auditoria.direccionIp,
    });

    return amenaza;
  });
}

export async function actualizarAmenazaConAuditoria(
  id: string,
  params: ActualizarAmenazaParams,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<AmenazaConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const actualizada = await tx.amenaza.update({
      where: { id },
      data: params,
      include: INCLUDE_RELACIONES,
    });

    await registrarAuditoria(tx, {
      usuarioId: auditoria.usuarioId,
      organizacionId: auditoria.organizacionId,
      entidad: "Amenaza",
      entidadId: id,
      accion: auditoria.accion,
      datosAnteriores: auditoria.datosAnteriores,
      datosNuevos: auditoria.datosNuevos,
      direccionIp: auditoria.direccionIp,
    });

    return actualizada;
  });
}


export async function eliminarAmenazaConAuditoria(
  id: string,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.amenaza.delete({ where: { id } });

    await registrarAuditoria(tx, {
      usuarioId: auditoria.usuarioId,
      organizacionId: auditoria.organizacionId,
      entidad: "Amenaza",
      entidadId: id,
      accion: auditoria.accion,
      datosAnteriores: auditoria.datosAnteriores,
      datosNuevos: auditoria.datosNuevos,
      direccionIp: auditoria.direccionIp,
    });
  });
}

