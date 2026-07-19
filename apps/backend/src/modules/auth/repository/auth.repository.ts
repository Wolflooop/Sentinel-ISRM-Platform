import { prisma } from "../../../config/prisma";
import { UsuarioConRol, UsuarioPerfil } from "../types/auth.types";



export async function findUsuarioPorEmail(email: string): Promise<UsuarioConRol | null> {
  return prisma.usuario.findUnique({
    where: { email },
    include: {
      rol: { select: { id: true, nombre: true, tipo: true } },
      organizacion: { select: { id: true, nombre: true, estado: true } },
    },
  });
}

export async function incrementarIntentosFallidos(usuarioId: string): Promise<void> {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { intentosFallidos: { increment: 1 } },
  });
}

export async function resetearIntentosFallidos(usuarioId: string): Promise<void> {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoLogin: new Date() },
  });
}

export async function bloquearUsuarioTemporalmente(
  usuarioId: string,
  bloqueadoHasta: Date
): Promise<void> {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { bloqueadoHasta },
  });
}

export async function crearSesion(params: {
  usuarioId: string;
  tokenHash: string;
  expiraEn: Date;
}): Promise<void> {
  await prisma.sesion.create({
    data: {
      usuarioId: params.usuarioId,
      tokenHash: params.tokenHash,
      expiraEn: params.expiraEn,
    },
  });
}

export async function findSesionActivaPorTokenHash(tokenHash: string) {
  return prisma.sesion.findUnique({
    where: { tokenHash },
  });
}

export async function revocarSesionPorTokenHash(tokenHash: string): Promise<void> {
 await prisma.sesion.updateMany({
    where: { tokenHash },
    data: { revocado: true },
  });
}


export async function findUsuarioPorId(id: string): Promise<UsuarioPerfil | null> {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: { select: { id: true, nombre: true, tipo: true } },
      organizacion: { select: { id: true, nombre: true } },
    },
  });
}

export async function findPermisosPorRol(
  rolId: string
): Promise<Array<{ recurso: string; accion: string }>> {
  const rolPermisos = await prisma.rolPermiso.findMany({
    where: { rolId },
    include: { permiso: { select: { recurso: true, accion: true } } },
  });
  return rolPermisos.map(
    (rp: { permiso: { recurso: string; accion: string } }) => rp.permiso
  );
}
