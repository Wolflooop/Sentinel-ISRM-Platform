import { AppError } from "../../../shared/AppError";
import { hashPassword } from "../../../shared/password";
import {
  findUsuariosPorOrganizacion,
  findUsuarioPorIdYOrganizacion,
  existeEmailEnOrganizacion,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  existeRol,
} from "../repository/users.repository";
import { UsuarioConRol } from "../types/users.types";
import {
  CrearUsuarioInput,
  ActualizarUsuarioInput,
} from "../schema/users.schema";

export async function listarUsuarios(organizacionId: string): Promise<UsuarioConRol[]> {
  return findUsuariosPorOrganizacion(organizacionId);
}

/**
 * Aislamiento multi-tenant: si el usuario existe pero pertenece a otra
 * organización, se responde 404 (no 403) para no revelar la existencia de
 * recursos de otras organizaciones.
 */
export async function obtenerUsuario(
  id: string,
  organizacionId: string
): Promise<UsuarioConRol> {
  const usuario = await findUsuarioPorIdYOrganizacion(id, organizacionId);
  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return usuario;
}

export async function crearUsuarioEnOrganizacion(
  organizacionId: string,
  input: CrearUsuarioInput
): Promise<UsuarioConRol> {
  const rolValido = await existeRol(input.rolId);
  if (!rolValido) {
    throw new AppError("El rol especificado no existe", 400);
  }

  const emailDuplicado = await existeEmailEnOrganizacion(organizacionId, input.email);
  if (emailDuplicado) {
    throw new AppError("Ya existe un usuario con ese correo en la organización", 409);
  }

  const passwordHash = await hashPassword(input.password);

  return crearUsuario({
    organizacionId,
    rolId: input.rolId,
    nombre: input.nombre,
    email: input.email,
    passwordHash,
  });
}

export async function actualizarUsuarioEnOrganizacion(
  id: string,
  organizacionId: string,
  input: ActualizarUsuarioInput
): Promise<UsuarioConRol> {
  // Verifica pertenencia a la organización antes de tocar cualquier dato.
  await obtenerUsuario(id, organizacionId);

  if (input.rolId) {
    const rolValido = await existeRol(input.rolId);
    if (!rolValido) {
      throw new AppError("El rol especificado no existe", 400);
    }
  }

  if (input.email) {
    const emailDuplicado = await existeEmailEnOrganizacion(organizacionId, input.email);
    if (emailDuplicado) {
      throw new AppError("Ya existe un usuario con ese correo en la organización", 409);
    }
  }

  return actualizarUsuario(id, input);
}

export async function cambiarEstadoUsuarioEnOrganizacion(
  id: string,
  organizacionId: string,
  activo: boolean
): Promise<UsuarioConRol> {
  await obtenerUsuario(id, organizacionId);
  return cambiarEstadoUsuario(id, activo);
}
