import { TipoRol } from "@prisma/client";
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
