import { prisma } from "../../../config/prisma";
import { UsuarioConRol } from "../types/auth.types";

/**
 * Único lugar autorizado para Prisma Client dentro del módulo auth
 * (Constitución: "Repository — Único lugar autorizado para Prisma Client").
 */

export async function findUsuarioByOrganizacionYEmail(
  organizacionNombre: string,
  email: string
): Promise<UsuarioConRol | null> {
  return prisma.usuario.findFirst({
    where: {
      email,
      organizacion: { nombre: organizacionNombre },
    },
    include: {
      rol: { select: { id: true, nombre: true } },
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
  // No se elimina el registro — solo se marca revocado (regla de la Constitución
  // y de la Fase 5: Sesion es de baja lógica, no de eliminación física).
  await prisma.sesion.updateMany({
    where: { tokenHash },
    data: { revocado: true },
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
