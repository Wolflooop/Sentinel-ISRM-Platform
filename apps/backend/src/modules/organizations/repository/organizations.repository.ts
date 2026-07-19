import { EstadoOrganizacion } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarOrganizacionParams,
  CrearOrganizacionParams,
  OrganizacionCompleta,
} from "../types/organizations.types";

export async function findOrganizacionPorId(
  id: string
): Promise<OrganizacionCompleta | null> {
  return prisma.organizacion.findUnique({ where: { id } });
}


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

export async function existeOrganizacionConNombre(nombre: string): Promise<boolean> {
  const existente = await prisma.organizacion.findUnique({
    where: { nombre },
    select: { id: true },
  });
  return existente !== null;
}

export async function crearOrganizacion(
  params: CrearOrganizacionParams
): Promise<OrganizacionCompleta> {
  return prisma.organizacion.create({ data: params });
}

// Solo la usa un SUPER_ADMIN: visión completa de todas las organizaciones
// de la plataforma.
export async function findOrganizaciones(): Promise<OrganizacionCompleta[]> {
  return prisma.organizacion.findMany({ orderBy: { creadoEn: "desc" } });
}

export interface RegistrarAuditoriaParams {
  usuarioId: string;
  organizacionId: string;
  entidad: string;
  entidadId: string;
  accion: "CREAR" | "EDITAR" | "ELIMINAR" | "APROBAR";
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
  direccionIp: string;
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
