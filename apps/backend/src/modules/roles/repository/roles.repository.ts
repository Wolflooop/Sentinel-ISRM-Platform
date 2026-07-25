import { prisma } from "../../../config/prisma";
import {
  Rol,
  RolConPermisos,
  CrearRolParams,
  ActualizarRolParams,
} from "../types/roles.types";

// Actor + organizacionId ya resuelto (nunca null: el service resuelve el
// caso SUPER_ADMIN vía shared/audit.ts antes de llegar aquí), necesarios
// para dejar el registro de Auditoria.
interface ActorAuditoriaRol {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

export async function findRoles(): Promise<Rol[]> {
  return prisma.rol.findMany({ orderBy: { nombre: "asc" } });
}

export async function findRolPorId(id: string): Promise<Rol | null> {
  return prisma.rol.findUnique({ where: { id } });
}

export async function findRolConPermisos(id: string): Promise<RolConPermisos | null> {
  const rol = await prisma.rol.findUnique({
    where: { id },
    include: {
      permisos: {
        include: {
          permiso: { select: { id: true, recurso: true, accion: true, descripcion: true } },
        },
      },
    },
  });

  if (!rol) return null;

  return {
    id: rol.id,
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    esSistema: rol.esSistema,
    tipo: rol.tipo,
    permisos: rol.permisos.map(
      (rp: {
        permiso: { id: string; recurso: string; accion: string; descripcion: string | null };
      }) => rp.permiso
    ),
  };
}

export async function existeNombreRol(nombre: string): Promise<boolean> {
  const existente = await prisma.rol.findUnique({ where: { nombre }, select: { id: true } });
  return existente !== null;
}

// La creación del Rol y su Auditoria son atómicas: si el registro de
// auditoría falla, la transacción revierte también la creación del rol
// (nunca queda un rol creado sin su rastro de auditoría, ni viceversa).
export async function crearRol(
  params: CrearRolParams,
  actor: ActorAuditoriaRol
): Promise<Rol> {
  return prisma.$transaction(async (tx) => {
    const rol = await tx.rol.create({
      data: {
        nombre: params.nombre,
        descripcion: params.descripcion,
        esSistema: false, // Solo el catálogo base (seed) puede marcar esSistema=true
      },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        entidad: "Rol",
        entidadId: rol.id,
        accion: "CREAR",
        datosNuevos: {
          nombre: params.nombre,
          descripcion: params.descripcion ?? null,
        } as never,
        direccionIp: actor.direccionIp,
      },
    });

    return rol;
  });
}

// datosAnteriores se recibe ya resuelto desde el service (el estado del rol
// antes de esta actualización), para no tener que releerlo dentro de la
// transacción.
export async function actualizarRol(
  id: string,
  params: ActualizarRolParams,
  actor: ActorAuditoriaRol,
  datosAnteriores: Pick<Rol, "nombre" | "descripcion">
): Promise<Rol> {
  return prisma.$transaction(async (tx) => {
    const rol = await tx.rol.update({ where: { id }, data: params });

    await tx.auditoria.create({
      data: {
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        entidad: "Rol",
        entidadId: rol.id,
        accion: "EDITAR",
        datosAnteriores: datosAnteriores as never,
        datosNuevos: {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
        } as never,
        direccionIp: actor.direccionIp,
      },
    });

    return rol;
  });
}

export async function existePermiso(permisoId: string): Promise<boolean> {
  const permiso = await prisma.permiso.findUnique({
    where: { id: permisoId },
    select: { id: true },
  });
  return permiso !== null;
}

export async function existeAsignacion(rolId: string, permisoId: string): Promise<boolean> {
  const asignacion = await prisma.rolPermiso.findUnique({
    where: { rolId_permisoId: { rolId, permisoId } },
  });
  return asignacion !== null;
}

export async function asignarPermisoARol(
  rolId: string,
  permisoId: string,
  actor: ActorAuditoriaRol
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.rolPermiso.create({ data: { rolId, permisoId } });

    await tx.auditoria.create({
      data: {
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        entidad: "Rol",
        entidadId: rolId,
        accion: "EDITAR",
        datosNuevos: {
          accion: "ASIGNAR_PERMISO",
          rolId,
          permisoId,
        } as never,
        direccionIp: actor.direccionIp,
      },
    });
  });
}

export async function quitarPermisoDeRol(
  rolId: string,
  permisoId: string,
  actor: ActorAuditoriaRol
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.rolPermiso.delete({
      where: { rolId_permisoId: { rolId, permisoId } },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        entidad: "Rol",
        entidadId: rolId,
        accion: "EDITAR",
        datosNuevos: {
          accion: "QUITAR_PERMISO",
          rolId,
          permisoId,
        } as never,
        direccionIp: actor.direccionIp,
      },
    });
  });
}
