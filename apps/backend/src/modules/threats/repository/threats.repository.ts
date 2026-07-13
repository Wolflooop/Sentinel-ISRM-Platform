import { prisma } from "../../../config/prisma";
import {
  AmenazaConRelaciones,
  CategoriaAmenaza,
  FiltrosAmenazas,
  CrearAmenazaParams,
  ActualizarAmenazaParams,
  RegistrarAuditoriaParams,
} from "../types/threats.types";

const INCLUDE_RELACIONES = {
  categoria: { select: { id: true, nombre: true } },
} as const;

/**
 * Catálogo híbrido (Fase 4 §4.3 / schema.prisma): incluye las amenazas
 * globales (`organizacionId = NULL`) junto con las propias de la
 * organización solicitante.
 */
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

/**
 * Unicidad de `nombre` solo entre las amenazas PROPIAS de la organización
 * (el `@@unique([organizacionId, nombre])` físico ya lo garantiza a nivel
 * de DB para filas con organizacionId no nulo; esta consulta da un mensaje
 * de error amigable en Service antes de llegar a esa restricción).
 */
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

/**
 * Equivalente, para Amenaza, del criterio ya aplicado a Activo en la
 * Fase 6: no puede eliminarse mientras participe en cualquier combinación
 * AAV vigente (Fase 5 §5.4: "una amenaza no puede eliminarse mientras
 * participe en combinaciones AAV vigentes").
 */
export async function existeAavParaAmenaza(amenazaId: string): Promise<boolean> {
  const aav = await prisma.activoAmenazaVulnerabilidad.findFirst({
    where: { amenazaId },
    select: { id: true },
  });
  return aav !== null;
}

export async function crearAmenaza(params: CrearAmenazaParams): Promise<AmenazaConRelaciones> {
  return prisma.amenaza.create({
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
}

export async function actualizarAmenaza(
  id: string,
  params: ActualizarAmenazaParams
): Promise<AmenazaConRelaciones> {
  return prisma.amenaza.update({
    where: { id },
    data: params,
    include: INCLUDE_RELACIONES,
  });
}

/**
 * Eliminación física — `Amenaza` no tiene campo `estado` (a diferencia de
 * `Activo`), por lo que no existe baja lógica para este modelo.
 */
export async function eliminarAmenaza(id: string): Promise<void> {
  await prisma.amenaza.delete({ where: { id } });
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
