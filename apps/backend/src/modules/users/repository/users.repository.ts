import { prisma } from "../../../config/prisma";
import { UsuarioConRol, CrearUsuarioParams, ActualizarUsuarioParams } from "../types/users.types";

const SELECT_CON_ROL = {
  id: true,
  organizacionId: true,
  rolId: true,
  nombre: true,
  email: true,
  activo: true,
  ultimoLogin: true,
  creadoEn: true,
  rol: { select: { id: true, nombre: true } },
} as const;

export async function findUsuariosPorOrganizacion(
  organizacionId: string
): Promise<UsuarioConRol[]> {
  return prisma.usuario.findMany({
    where: { organizacionId },
    select: SELECT_CON_ROL,
    orderBy: { creadoEn: "desc" },
  });
}

export async function findUsuarioPorIdYOrganizacion(
  id: string,
  organizacionId: string
): Promise<UsuarioConRol | null> {
  return prisma.usuario.findFirst({
    where: { id, organizacionId },
    select: SELECT_CON_ROL,
  });
}

export async function existeEmailEnOrganizacion(
  organizacionId: string,
  email: string
): Promise<boolean> {
  const existente = await prisma.usuario.findUnique({
    where: { organizacionId_email: { organizacionId, email } },
    select: { id: true },
  });
  return existente !== null;
}

export async function crearUsuario(params: CrearUsuarioParams): Promise<UsuarioConRol> {
  return prisma.usuario.create({
    data: {
      organizacionId: params.organizacionId,
      rolId: params.rolId,
      nombre: params.nombre,
      email: params.email,
      passwordHash: params.passwordHash,
    },
    select: SELECT_CON_ROL,
  });
}

export async function actualizarUsuario(
  id: string,
  params: ActualizarUsuarioParams
): Promise<UsuarioConRol> {
  return prisma.usuario.update({
    where: { id },
    data: params,
    select: SELECT_CON_ROL,
  });
}

export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean
): Promise<UsuarioConRol> {
  return prisma.usuario.update({
    where: { id },
    data: { activo },
    select: SELECT_CON_ROL,
  });
}

export async function existeRol(rolId: string): Promise<boolean> {
  const rol = await prisma.rol.findUnique({ where: { id: rolId }, select: { id: true } });
  return rol !== null;
}
