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


export async function findVulnerabilidades(
  filtros: FiltrosVulnerabilidades
): Promise<VulnerabilidadConRelaciones[]> {
  return prisma.vulnerabilidad.findMany({
    where: {
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

export async function findVulnerabilidadPorId(
  id: string
): Promise<VulnerabilidadConRelaciones | null> {
  return prisma.vulnerabilidad.findUnique({
    where: { id },
    include: INCLUDE_RELACIONES,
  });
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

export async function crearVulnerabilidad(
  params: CrearVulnerabilidadParams
): Promise<VulnerabilidadConRelaciones> {
  return prisma.vulnerabilidad.create({
    data: {
      categoriaId: params.categoriaId,
      nombre: params.nombre,
      descripcion: params.descripcion,
      severidad: params.severidad,
      referenciaCVE: params.referenciaCVE,
    },
    include: INCLUDE_RELACIONES,
  });
}

export async function actualizarVulnerabilidad(
  id: string,
  params: ActualizarVulnerabilidadParams
): Promise<VulnerabilidadConRelaciones> {
  return prisma.vulnerabilidad.update({
    where: { id },
    data: params,
    include: INCLUDE_RELACIONES,
  });
}


export async function eliminarVulnerabilidad(id: string): Promise<void> {
  await prisma.vulnerabilidad.delete({ where: { id } });
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
