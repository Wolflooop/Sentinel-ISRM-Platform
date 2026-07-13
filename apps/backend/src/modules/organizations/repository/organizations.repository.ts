import { EstadoOrganizacion } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarOrganizacionParams,
  OrganizacionCompleta,
} from "../types/organizations.types";

export async function findOrganizacionPorId(
  id: string
): Promise<OrganizacionCompleta | null> {
  return prisma.organizacion.findUnique({ where: { id } });
}

/**
 * `Organizacion.nombre` es único (schema.prisma). Verifica duplicado
 * excluyendo la propia organización que se está actualizando.
 */
export async function existeOtraOrganizacionConNombre(
  nombre: string,
  organizacionId: string
): Promise<boolean> {
  const existente = await prisma.organizacion.findUnique({
    where: { nombre },
    select: { id: true },
  });
  return existente !== null && existente.id !== organizacionId;
}

export async function actualizarOrganizacion(
  id: string,
  params: ActualizarOrganizacionParams
): Promise<OrganizacionCompleta> {
  return prisma.organizacion.update({ where: { id }, data: params });
}

export async function cambiarEstadoOrganizacion(
  id: string,
  estado: EstadoOrganizacion
): Promise<OrganizacionCompleta> {
  return prisma.organizacion.update({ where: { id }, data: { estado } });
}

/**
 * Regla de negocio de la Fase 5 (Reglas de Integridad, sección 5.1):
 * "Al cambiar Organizacion.estado a 'Inactiva' o 'Suspendida', el sistema
 * debe revocar las sesiones activas de todos sus usuarios." Usa únicamente
 * la entidad `Sesion` ya existente — ninguna entidad nueva.
 */
export async function revocarSesionesActivasDeOrganizacion(
  organizacionId: string
): Promise<void> {
  await prisma.sesion.updateMany({
    where: {
      revocado: false,
      usuario: { organizacionId },
    },
    data: { revocado: true },
  });
}
