import { TipoRol } from "@prisma/client";
import { AppError } from "../../../shared/AppError";
import { hashPassword } from "../../../shared/password";
import {
  findUsuariosPorOrganizacion,
  findUsuarioPorIdYOrganizacion,
  existeEmailGlobal,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  findRolConTipoPorId,
  existeOrganizacionActiva,
} from "../repository/users.repository";
import { registrarEventoSeguridad } from "../../security-events/service/security-events.service";
import { UsuarioConRol } from "../types/users.types";
import {
  CrearUsuarioInput,
  ActualizarUsuarioInput,
} from "../schema/users.schema";

// Identidad del actor que realiza la operación, tomada SIEMPRE del JWT
// (req.user), nunca de datos enviados en el body.
export interface ActorUsuarios {
  usuarioId: string;
  organizacionId: string | null;
  tipoRol: TipoRol;
  direccionIp: string;
}

/**
 * Lista de usuarios. Un SUPER_ADMIN (organizacionId null en su propio
 * token) ve la plataforma completa; cualquier otro rol solo ve su propia
 * organización, aplicada siempre como filtro obligatorio en el repositorio.
 */
export async function listarUsuarios(actor: ActorUsuarios): Promise<UsuarioConRol[]> {
  return findUsuariosPorOrganizacion(actor.organizacionId);
}

export async function obtenerUsuario(
  id: string,
  actor: ActorUsuarios
): Promise<UsuarioConRol> {
  const usuario = await findUsuarioPorIdYOrganizacion(id, actor.organizacionId);
  if (!usuario) {
    throw new AppError("Usuario no encontrado", 404);
  }
  return usuario;
}

/**
 * Implementa la jerarquía de creación de usuarios exigida:
 *
 *   USUARIO_COMUN  -> bloqueado por completo.
 *   ADMIN_TIC      -> solo puede crear USUARIO_COMUN; organizacionId
 *                     SIEMPRE se toma de su propio token, ignorando
 *                     cualquier organizacionId que venga en el body.
 *   SUPER_ADMIN    -> puede crear ADMIN_TIC o USUARIO_COMUN (nunca otro
 *                     SUPER_ADMIN desde este endpoint); DEBE indicar la
 *                     organización de destino, y esta debe existir y estar
 *                     activa.
 *
 * Cualquier intento fuera de estas reglas se registra como evento de
 * seguridad (intento de escalamiento de privilegios) y se rechaza con 403.
 */
export async function crearUsuarioComoActor(
  actor: ActorUsuarios,
  input: CrearUsuarioInput
): Promise<UsuarioConRol> {
  if (actor.tipoRol === "USUARIO_COMUN") {
    await registrarEventoSeguridad({
      evento: "AUTH_ACCESS_DENIED",
      resultado: "FALLIDO",
      severidad: "ALTA",
      direccionIp: actor.direccionIp,
      descripcion: "Un USUARIO_COMUN intentó crear un usuario",
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
    });
    throw new AppError("No tiene permiso para crear usuarios", 403);
  }

  const rolDestino = await findRolConTipoPorId(input.rolId);
  if (!rolDestino) {
    throw new AppError("El rol especificado no existe", 400);
  }

  let organizacionDestinoId: string;

  if (actor.tipoRol === "ADMIN_TIC") {
    // Un ADMIN_TIC solo puede crear USUARIO_COMUN.
    if (rolDestino.tipo !== "USUARIO_COMUN") {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "CRITICA",
        direccionIp: actor.direccionIp,
        descripcion:
          "Un ADMIN_TIC intentó crear un usuario con un rol de nivel superior a USUARIO_COMUN",
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        detalles: { rolSolicitado: rolDestino.tipo },
      });
      throw new AppError("Solo puede crear usuarios comunes", 403);
    }

    // organizacionId NUNCA se acepta del body para un ADMIN_TIC, aunque el
    // frontend no lo muestre: si llega igual, se registra y se ignora.
    if (input.organizacionId && input.organizacionId !== actor.organizacionId) {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "CRITICA",
        direccionIp: actor.direccionIp,
        descripcion:
          "Un ADMIN_TIC envió un organizacionId distinto al propio al crear un usuario (ignorado)",
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        detalles: { organizacionIdEnviado: input.organizacionId },
      });
    }

    if (!actor.organizacionId) {
      // No debería ocurrir nunca (invariante de datos), pero se valida por
      // defensa en profundidad.
      throw new AppError("El actor no tiene una organización asociada", 500);
    }
    organizacionDestinoId = actor.organizacionId;
  } else {
    // actor.tipoRol === "SUPER_ADMIN"
    if (rolDestino.tipo === "SUPER_ADMIN") {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "CRITICA",
        direccionIp: actor.direccionIp,
        descripcion:
          "Intento de crear un nuevo SUPER_ADMIN a través del endpoint de creación de usuarios",
        usuarioId: actor.usuarioId,
        organizacionId: null,
      });
      throw new AppError(
        "No se pueden crear administradores principales desde este endpoint",
        403
      );
    }

    if (!input.organizacionId) {
      throw new AppError(
        "Debe seleccionar la organización para el nuevo usuario",
        400
      );
    }

    const organizacionActiva = await existeOrganizacionActiva(input.organizacionId);
    if (!organizacionActiva) {
      throw new AppError("La organización seleccionada no existe o no está activa", 400);
    }

    organizacionDestinoId = input.organizacionId;
  }

  const emailDuplicado = await existeEmailGlobal(input.email);
  if (emailDuplicado) {
    throw new AppError("Ya existe un usuario con ese correo en la plataforma", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const usuarioCreado = await crearUsuario(
    {
      organizacionId: organizacionDestinoId,
      rolId: input.rolId,
      nombre: input.nombre,
      email: input.email,
      passwordHash,
    },
    {
      usuarioId: actor.usuarioId,
      organizacionId: organizacionDestinoId,
      direccionIp: actor.direccionIp,
    }
  );

  return usuarioCreado;
}

export async function actualizarUsuarioComoActor(
  id: string,
  actor: ActorUsuarios,
  input: ActualizarUsuarioInput
): Promise<UsuarioConRol> {
  // Verifica pertenencia a la organización (o alcance global de
  // SUPER_ADMIN) antes de tocar cualquier dato.
  const usuarioExistente = await obtenerUsuario(id, actor);

  if (actor.tipoRol === "USUARIO_COMUN") {
    await registrarEventoSeguridad({
      evento: "AUTH_ACCESS_DENIED",
      resultado: "FALLIDO",
      severidad: "ALTA",
      direccionIp: actor.direccionIp,
      descripcion: "Un USUARIO_COMUN intentó modificar un usuario",
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      detalles: { usuarioObjetivo: id },
    });
    throw new AppError("No tiene permiso para modificar usuarios", 403);
  }

  if (input.rolId) {
    const rolDestino = await findRolConTipoPorId(input.rolId);
    if (!rolDestino) {
      throw new AppError("El rol especificado no existe", 400);
    }
    if (actor.tipoRol === "ADMIN_TIC" && rolDestino.tipo !== "USUARIO_COMUN") {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "CRITICA",
        direccionIp: actor.direccionIp,
        descripcion: "Un ADMIN_TIC intentó asignar un rol de nivel superior a USUARIO_COMUN",
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        detalles: { usuarioObjetivo: id, rolSolicitado: rolDestino.tipo },
      });
      throw new AppError("Solo puede asignar el rol de usuario común", 403);
    }
    if (rolDestino.tipo === "SUPER_ADMIN") {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "CRITICA",
        direccionIp: actor.direccionIp,
        descripcion: "Intento de asignar el rol SUPER_ADMIN mediante actualización de usuario",
        usuarioId: actor.usuarioId,
        organizacionId: actor.organizacionId,
        detalles: { usuarioObjetivo: id },
      });
      throw new AppError("No se puede asignar el rol de administrador principal aquí", 403);
    }
  }

  if (input.email) {
    const emailDuplicado = await existeEmailGlobal(input.email);
    if (emailDuplicado && input.email !== usuarioExistente.email) {
      throw new AppError("Ya existe un usuario con ese correo en la plataforma", 409);
    }
  }

  const usuarioActualizado = await actualizarUsuario(
    id,
    input,
    usuarioExistente.organizacionId
      ? {
          actor: {
            usuarioId: actor.usuarioId,
            organizacionId: usuarioExistente.organizacionId,
            direccionIp: actor.direccionIp,
          },
          datosAnteriores: {
            nombre: usuarioExistente.nombre,
            email: usuarioExistente.email,
            rolId: usuarioExistente.rolId,
          },
        }
      : undefined
  );

  return usuarioActualizado;
}

export async function cambiarEstadoUsuarioComoActor(
  id: string,
  actor: ActorUsuarios,
  activo: boolean
): Promise<UsuarioConRol> {
  if (actor.tipoRol === "USUARIO_COMUN") {
    await registrarEventoSeguridad({
      evento: "AUTH_ACCESS_DENIED",
      resultado: "FALLIDO",
      severidad: "ALTA",
      direccionIp: actor.direccionIp,
      descripcion: "Un USUARIO_COMUN intentó cambiar el estado de un usuario",
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      detalles: { usuarioObjetivo: id },
    });
    throw new AppError("No tiene permiso para modificar usuarios", 403);
  }

  const usuarioExistente = await obtenerUsuario(id, actor);
  const usuarioActualizado = await cambiarEstadoUsuario(
    id,
    activo,
    usuarioExistente.organizacionId
      ? {
          actor: {
            usuarioId: actor.usuarioId,
            organizacionId: usuarioExistente.organizacionId,
            direccionIp: actor.direccionIp,
          },
          datosAnteriores: { activo: usuarioExistente.activo },
        }
      : undefined
  );

  return usuarioActualizado;
}
