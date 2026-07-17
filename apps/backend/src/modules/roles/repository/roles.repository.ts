import { prisma } from "../../../config/prisma";
import { Rol, RolConPermisos, CrearRolParams, ActualizarRolParams } from "../types/roles.types";

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

export async function crearRol(params: CrearRolParams): Promise<Rol> {
  return prisma.rol.create({
    data: {
      nombre: params.nombre,
      descripcion: params.descripcion,
      esSistema: false, // Solo el catálogo base (seed) puede marcar esSistema=true
    },
  });
}

export async function actualizarRol(id: string, params: ActualizarRolParams): Promise<Rol> {
  return prisma.rol.update({ where: { id }, data: params });
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

export async function asignarPermisoARol(rolId: string, permisoId: string): Promise<void> {
  await prisma.rolPermiso.create({ data: { rolId, permisoId } });
}

export async function quitarPermisoDeRol(rolId: string, permisoId: string): Promise<void> {

  await prisma.rolPermiso.delete({
    where: { rolId_permisoId: { rolId, permisoId } },
  });
}
