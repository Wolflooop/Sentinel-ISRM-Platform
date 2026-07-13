import { prisma } from "../../../config/prisma";
import {
  Activo,
  ActivoConRelaciones,
  CategoriaActivo,
  FiltrosActivos,
  CrearActivoParams,
  ActualizarActivoParams,
  RegistrarAuditoriaParams,
} from "../types/assets.types";

const INCLUDE_RELACIONES = {
  categoria: { select: { id: true, nombre: true } },
  usuarioResponsable: { select: { id: true, nombre: true } },
} as const;

function serializarDecimal(valor: unknown): string | null {
  return valor === null || valor === undefined ? null : String(valor);
}

function serializarActivo(activo: any): ActivoConRelaciones {
  return { ...activo, valorEconomicoEstimado: serializarDecimal(activo.valorEconomicoEstimado) };
}

export async function findActivosPorOrganizacion(
  organizacionId: string,
  filtros: FiltrosActivos
): Promise<ActivoConRelaciones[]> {
  const activos = await prisma.activo.findMany({
    where: {
      organizacionId,
      ...(filtros.categoriaId ? { categoriaId: filtros.categoriaId } : {}),
      ...(filtros.criticidad ? { criticidad: filtros.criticidad } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.busqueda
        ? { nombre: { contains: filtros.busqueda, mode: "insensitive" as const } }
        : {}),
    },
    include: INCLUDE_RELACIONES,
    orderBy: { nombre: "asc" },
  });
  return activos.map(serializarActivo);
}

export async function findActivoPorIdYOrganizacion(
  id: string,
  organizacionId: string
): Promise<ActivoConRelaciones | null> {
  const activo = await prisma.activo.findFirst({
    where: { id, organizacionId },
    include: INCLUDE_RELACIONES,
  });
  return activo ? serializarActivo(activo) : null;
}

export async function existeOtroActivoConNombre(
  organizacionId: string,
  nombre: string,
  excluirId?: string
): Promise<boolean> {
  const existente = await prisma.activo.findFirst({
    where: {
      organizacionId,
      nombre,
      ...(excluirId ? { id: { not: excluirId } } : {}),
    },
    select: { id: true },
  });
  return existente !== null;
}

export async function existeCategoriaActivo(categoriaId: string): Promise<boolean> {
  const categoria = await prisma.categoriaActivo.findUnique({
    where: { id: categoriaId },
    select: { id: true },
  });
  return categoria !== null;
}

export async function findCategoriasActivo(): Promise<CategoriaActivo[]> {
  return prisma.categoriaActivo.findMany({ orderBy: { nombre: "asc" } });
}

/**
 * Fase 5 §5.3: "Todo activo debe tener un usuario responsable válido,
 * perteneciente a la misma organización que el activo" — se valida aquí
 * contra Usuario, no mediante una FK compuesta (Prisma no lo soporta para
 * este caso sin duplicar organizacionId en la relación).
 */
export async function existeUsuarioEnOrganizacion(
  usuarioId: string,
  organizacionId: string
): Promise<boolean> {
  const usuario = await prisma.usuario.findFirst({
    where: { id: usuarioId, organizacionId },
    select: { id: true },
  });
  return usuario !== null;
}

/**
 * Fase 5 §5.4: un activo no puede pasar a RETIRADO si participa en
 * combinaciones AAV con un Riesgo en estado distinto de CERRADO.
 */
export async function existeRiesgoAbiertoParaActivo(activoId: string): Promise<boolean> {
  const aavConRiesgoAbierto = await prisma.activoAmenazaVulnerabilidad.findFirst({
    where: {
      activoId,
      riesgo: { estado: { not: "CERRADO" } },
    },
    select: { id: true },
  });
  return aavConRiesgoAbierto !== null;
}

export async function crearActivo(params: CrearActivoParams): Promise<ActivoConRelaciones> {
  const activo = await prisma.activo.create({
    data: {
      organizacionId: params.organizacionId,
      categoriaId: params.categoriaId,
      nombre: params.nombre,
      descripcion: params.descripcion,
      usuarioResponsableId: params.usuarioResponsableId,
      ubicacion: params.ubicacion,
      criticidad: params.criticidad,
      valorEconomicoEstimado: params.valorEconomicoEstimado,
      estado: "ACTIVO",
    },
    include: INCLUDE_RELACIONES,
  });
  return serializarActivo(activo);
}

export async function actualizarActivo(
  id: string,
  params: ActualizarActivoParams
): Promise<ActivoConRelaciones> {
  const activo = await prisma.activo.update({
    where: { id },
    data: params,
    include: INCLUDE_RELACIONES,
  });
  return serializarActivo(activo);
}

export async function cambiarEstadoActivo(
  id: string,
  estado: Activo["estado"]
): Promise<ActivoConRelaciones> {
  const activo = await prisma.activo.update({
    where: { id },
    data: { estado },
    include: INCLUDE_RELACIONES,
  });
  return serializarActivo(activo);
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
