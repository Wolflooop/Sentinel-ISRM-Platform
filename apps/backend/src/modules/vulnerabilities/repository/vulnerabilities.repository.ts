import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarVulnerabilidadParams,
  CategoriaVulnerabilidad,
  CrearVulnerabilidadParams,
  FiltrosVulnerabilidades,
  RegistrarAuditoriaParams,
  VulnerabilidadConRelaciones,
} from "../types/vulnerabilities.types";

const INCLUDE_RELACIONES = {
  categoria: { select: { id: true, nombre: true } },
} as const;

// V2 (punto 8 del prompt): catálogo híbrido global/organización, idéntico
// criterio que threats.repository.ts para Amenaza.
export async function findVulnerabilidadesVisiblesParaOrganizacion(
  organizacionId: string,
  filtros: FiltrosVulnerabilidades
): Promise<VulnerabilidadConRelaciones[]> {
  return prisma.vulnerabilidad.findMany({
    where: {
      OR: [{ organizacionId: null }, { organizacionId }],
      ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
      ...(filtros.severidad ? { severidad: filtros.severidad } : {}),
      ...(filtros.busqueda
        ? { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } }
        : {}),
    },
    include: INCLUDE_RELACIONES,
    orderBy: { nombre: "asc" },
  });
}

export async function findVulnerabilidadVisiblePorId(
  id: string,
  organizacionId: string
): Promise<VulnerabilidadConRelaciones | null> {
  return prisma.vulnerabilidad.findFirst({
    where: { id, OR: [{ organizacionId: null }, { organizacionId }] },
    include: INCLUDE_RELACIONES,
  });
}

export async function existeOtraVulnerabilidadConNombreEnOrganizacion(
  organizacionId: string,
  nombre: string,
  excluirId?: string
): Promise<boolean> {
  const existente = await prisma.vulnerabilidad.findFirst({
    where: {
      organizacionId,
      nombre,
      ...(excluirId ? { id: { not: excluirId } } : {}),
    },
    select: { id: true },
  });
  return existente !== null;
}

export async function existeCategoriaVulnerabilidad(categoriaId: string): Promise<boolean> {
  const categoria = await prisma.categoriaVulnerabilidad.findUnique({
    where: { id: categoriaId },
    select: { id: true },
  });
  return categoria !== null;
}

export async function findCategoriasVulnerabilidad(): Promise<CategoriaVulnerabilidad[]> {
  return prisma.categoriaVulnerabilidad.findMany({ orderBy: { nombre: "asc" } });
}

export async function existeAavParaVulnerabilidad(vulnerabilidadId: string): Promise<boolean> {
  const aav = await prisma.activoAmenazaVulnerabilidad.findFirst({
    where: { vulnerabilidadId },
    select: { id: true },
  });
  return aav !== null;
}

export async function crearVulnerabilidadConAuditoria(
  params: CrearVulnerabilidadParams,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<VulnerabilidadConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const vulnerabilidad = await tx.vulnerabilidad.create({
      data: {
        organizacionId: params.organizacionId,
        categoriaId: params.categoriaId,
        nombre: params.nombre,
        descripcion: params.descripcion,
        severidad: params.severidad,
        referenciaCVE: params.referenciaCVE,
        esPredefinida: false,
      },
      include: INCLUDE_RELACIONES,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Vulnerabilidad",
        entidadId: vulnerabilidad.id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return vulnerabilidad;
  });
}

export async function actualizarVulnerabilidadConAuditoria(
  id: string,
  params: ActualizarVulnerabilidadParams,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<VulnerabilidadConRelaciones> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const actualizada = await tx.vulnerabilidad.update({
      where: { id },
      data: params,
      include: INCLUDE_RELACIONES,
    });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Vulnerabilidad",
        entidadId: id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });

    return actualizada;
  });
}

export async function eliminarVulnerabilidadConAuditoria(
  id: string,
  auditoria: Omit<RegistrarAuditoriaParams, "entidad" | "entidadId">
): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.vulnerabilidad.delete({ where: { id } });

    await tx.auditoria.create({
      data: {
        usuarioId: auditoria.usuarioId,
        organizacionId: auditoria.organizacionId,
        entidad: "Vulnerabilidad",
        entidadId: id,
        accion: auditoria.accion,
        datosAnteriores: auditoria.datosAnteriores as never,
        datosNuevos: auditoria.datosNuevos as never,
        direccionIp: auditoria.direccionIp,
      },
    });
  });
}
