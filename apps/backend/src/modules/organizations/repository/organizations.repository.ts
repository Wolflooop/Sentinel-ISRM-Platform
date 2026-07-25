import { EstadoOrganizacion } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import {
  ActualizarOrganizacionParams,
  CrearOrganizacionParams,
  OrganizacionCompleta,
} from "../types/organizations.types";
import { registrarAuditoria } from "../../../shared/audit";

interface ActorAuditoriaOrganizacion {
  usuarioId: string;
  direccionIp: string;
}

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
  params: ActualizarOrganizacionParams,
  actor: ActorAuditoriaOrganizacion,
  datosAnteriores: Pick<OrganizacionCompleta, "nombre" | "sector">
): Promise<OrganizacionCompleta> {
  return prisma.$transaction(async (tx) => {
    const organizacion = await tx.organizacion.update({ where: { id }, data: params });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: id,
      entidad: "Organizacion",
      entidadId: id,
      accion: "EDITAR",
      datosAnteriores,
      datosNuevos: params,
      direccionIp: actor.direccionIp,
    });

    return organizacion;
  });
}

// `revocarSesiones` se ejecuta dentro de la misma transacción que el
// cambio de estado y su Auditoria (antes se invocaba aparte desde el
// servicio, después del cambio de estado pero fuera de cualquier
// transacción): si SUSPENDIDA/INACTIVA implica revocar sesiones activas,
// eso debe revertirse también si el registro de auditoría falla.
export async function cambiarEstadoOrganizacion(
  id: string,
  estado: EstadoOrganizacion,
  actor: ActorAuditoriaOrganizacion,
  datosAnteriores: { estado: EstadoOrganizacion },
  revocarSesiones: boolean
): Promise<OrganizacionCompleta> {
  return prisma.$transaction(async (tx) => {
    const organizacion = await tx.organizacion.update({ where: { id }, data: { estado } });

    if (revocarSesiones) {
      await tx.sesion.updateMany({
        where: {
          revocado: false,
          usuario: { organizacionId: id },
        },
        data: { revocado: true },
      });
    }

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: id,
      entidad: "Organizacion",
      entidadId: id,
      accion: "EDITAR",
      datosAnteriores,
      datosNuevos: { estado: organizacion.estado },
      direccionIp: actor.direccionIp,
    });

    return organizacion;
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
  params: CrearOrganizacionParams,
  actor: ActorAuditoriaOrganizacion
): Promise<OrganizacionCompleta> {
  return prisma.$transaction(async (tx) => {
    const organizacion = await tx.organizacion.create({ data: params });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: organizacion.id,
      entidad: "Organizacion",
      entidadId: organizacion.id,
      accion: "CREAR",
      datosNuevos: { nombre: organizacion.nombre, sector: organizacion.sector },
      direccionIp: actor.direccionIp,
    });

    return organizacion;
  });
}

// Solo la usa un SUPER_ADMIN: visión completa de todas las organizaciones
// de la plataforma.
export async function findOrganizaciones(): Promise<OrganizacionCompleta[]> {
  return prisma.organizacion.findMany({ orderBy: { creadoEn: "desc" } });
}

