import { TipoRol } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { UsuarioConRol, CrearUsuarioParams, ActualizarUsuarioParams } from "../types/users.types";
import { registrarAuditoria } from "../../../shared/audit";

// organizacionId YA resuelto (nunca null) por quien llama: si el usuario
// objetivo es un SUPER_ADMIN (Usuario.organizacionId null), el servicio
// omite por completo pasar este objeto — mismo comportamiento previo de no
// dejar registro de Auditoria en ese caso puntual (ver users.service.ts).
interface ActorAuditoriaUsuario {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

const SELECT_CON_ROL = {
  id: true,
  organizacionId: true,
  rolId: true,
  nombre: true,
  email: true,
  activo: true,
  ultimoLogin: true,
  creadoEn: true,
  rol: { select: { id: true, nombre: true, tipo: true } },
} as const;

// organizacionId === null => alcance global (solo lo usa un SUPER_ADMIN).
// Para ADMIN_TIC/USUARIO_COMUN el controller siempre pasa un id concreto,
// nunca null, así que este caso jamás filtra entre organizaciones distintas
// para un usuario no-SUPER_ADMIN.
export async function findUsuariosPorOrganizacion(
  organizacionId: string | null
): Promise<UsuarioConRol[]> {
  return prisma.usuario.findMany({
    where: organizacionId !== null ? { organizacionId } : {},
    select: SELECT_CON_ROL,
    orderBy: { creadoEn: "desc" },
  });
}

export async function findUsuarioPorIdYOrganizacion(
  id: string,
  organizacionId: string | null
): Promise<UsuarioConRol | null> {
  return prisma.usuario.findFirst({
    where: organizacionId !== null ? { id, organizacionId } : { id },
    select: SELECT_CON_ROL,
  });
}

// Unicidad GLOBAL de correo (ver Fase 7 y schema.prisma: Usuario.email es
// @unique a nivel de toda la plataforma, no por organización).
export async function existeEmailGlobal(email: string): Promise<boolean> {
  const existente = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  });
  return existente !== null;
}

export async function crearUsuario(
  params: CrearUsuarioParams,
  actor: ActorAuditoriaUsuario
): Promise<UsuarioConRol> {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        organizacionId: params.organizacionId,
        rolId: params.rolId,
        nombre: params.nombre,
        email: params.email,
        passwordHash: params.passwordHash,
      },
      select: SELECT_CON_ROL,
    });

    await registrarAuditoria(tx, {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      entidad: "Usuario",
      entidadId: usuario.id,
      accion: "CREAR",
      datosNuevos: { nombre: usuario.nombre, email: usuario.email, rolId: params.rolId },
      direccionIp: actor.direccionIp,
    });

    return usuario;
  });
}

export async function actualizarUsuario(
  id: string,
  params: ActualizarUsuarioParams,
  auditoria?: {
    actor: ActorAuditoriaUsuario;
    datosAnteriores: { nombre: string; email: string; rolId: string };
  }
): Promise<UsuarioConRol> {
  // Sin `auditoria` => el usuario objetivo no tiene organizacionId resuelto
  // (SUPER_ADMIN): se preserva el comportamiento previo de actualizar sin
  // dejar registro de Auditoria.
  if (!auditoria) {
    return prisma.usuario.update({ where: { id }, data: params, select: SELECT_CON_ROL });
  }

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.update({ where: { id }, data: params, select: SELECT_CON_ROL });

    await registrarAuditoria(tx, {
      usuarioId: auditoria.actor.usuarioId,
      organizacionId: auditoria.actor.organizacionId,
      entidad: "Usuario",
      entidadId: id,
      accion: "EDITAR",
      datosAnteriores: auditoria.datosAnteriores,
      datosNuevos: params,
      direccionIp: auditoria.actor.direccionIp,
    });

    return usuario;
  });
}

export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean,
  auditoria?: {
    actor: ActorAuditoriaUsuario;
    datosAnteriores: { activo: boolean };
  }
): Promise<UsuarioConRol> {
  if (!auditoria) {
    return prisma.usuario.update({ where: { id }, data: { activo }, select: SELECT_CON_ROL });
  }

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.update({ where: { id }, data: { activo }, select: SELECT_CON_ROL });

    await registrarAuditoria(tx, {
      usuarioId: auditoria.actor.usuarioId,
      organizacionId: auditoria.actor.organizacionId,
      entidad: "Usuario",
      entidadId: id,
      accion: "EDITAR",
      datosAnteriores: auditoria.datosAnteriores,
      datosNuevos: { activo },
      direccionIp: auditoria.actor.direccionIp,
    });

    return usuario;
  });
}

// Devuelve el rol junto con su TipoRol, para que el servicio pueda validar
// la jerarquía (quién puede asignar qué rol) sin volver a consultar aparte.
export async function findRolConTipoPorId(
  rolId: string
): Promise<{ id: string; nombre: string; tipo: TipoRol } | null> {
  return prisma.rol.findUnique({
    where: { id: rolId },
    select: { id: true, nombre: true, tipo: true },
  });
}

export async function existeOrganizacionActiva(organizacionId: string): Promise<boolean> {
  const org = await prisma.organizacion.findUnique({
    where: { id: organizacionId },
    select: { estado: true },
  });
  return org !== null && org.estado === "ACTIVA";
}

