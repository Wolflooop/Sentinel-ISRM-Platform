import { AppError } from "../../../shared/AppError";
import {
  findRoles,
  findRolPorId,
  findRolConPermisos,
  existeNombreRol,
  crearRol,
  actualizarRol,
  existePermiso,
  existeAsignacion,
  asignarPermisoARol,
  quitarPermisoDeRol,
} from "../repository/roles.repository";
import { Rol, RolConPermisos } from "../types/roles.types";
import { CrearRolInput, ActualizarRolInput } from "../schema/roles.schema";

export async function listarRoles(): Promise<Rol[]> {
  return findRoles();
}

export async function obtenerRol(id: string): Promise<Rol> {
  const rol = await findRolPorId(id);
  if (!rol) {
    throw new AppError("Rol no encontrado", 404);
  }
  return rol;
}

export async function obtenerRolConPermisos(id: string): Promise<RolConPermisos> {
  const rol = await findRolConPermisos(id);
  if (!rol) {
    throw new AppError("Rol no encontrado", 404);
  }
  return rol;
}

export async function crearNuevoRol(input: CrearRolInput): Promise<Rol> {
  const nombreDuplicado = await existeNombreRol(input.nombre);
  if (nombreDuplicado) {
    throw new AppError("Ya existe un rol con ese nombre", 409);
  }
  return crearRol(input);
}


export async function actualizarRolExistente(
  id: string,
  input: ActualizarRolInput
): Promise<Rol> {
  const rol = await obtenerRol(id);

  if (rol.esSistema && input.nombre && input.nombre !== rol.nombre) {
    throw new AppError("No se puede modificar el nombre de un rol del sistema", 403);
  }

  if (input.nombre && input.nombre !== rol.nombre) {
    const nombreDuplicado = await existeNombreRol(input.nombre);
    if (nombreDuplicado) {
      throw new AppError("Ya existe un rol con ese nombre", 409);
    }
  }

  return actualizarRol(id, input);
}

export async function asignarPermiso(rolId: string, permisoId: string): Promise<RolConPermisos> {
  await obtenerRol(rolId); // valida existencia del rol

  const permisoValido = await existePermiso(permisoId);
  if (!permisoValido) {
    throw new AppError("El permiso especificado no existe", 400);
  }

  const yaAsignado = await existeAsignacion(rolId, permisoId);
  if (yaAsignado) {
    throw new AppError("El permiso ya está asignado a este rol", 409);
  }

  await asignarPermisoARol(rolId, permisoId);
  return obtenerRolConPermisos(rolId);
}


export async function quitarPermiso(rolId: string, permisoId: string): Promise<RolConPermisos> {
  const rol = await obtenerRol(rolId); // valida existencia del rol

  const asignado = await existeAsignacion(rolId, permisoId);
  if (!asignado) {
    throw new AppError("El permiso no está asignado a este rol", 404);
  }

  if (rol.esSistema) {
    const rolConPermisos = await obtenerRolConPermisos(rolId);
    if (rolConPermisos.permisos.length <= 1) {
      throw new AppError(
        "No se puede quitar el último permiso de un rol del sistema",
        403
      );
    }
  }

  await quitarPermisoDeRol(rolId, permisoId);
  return obtenerRolConPermisos(rolId);
}
