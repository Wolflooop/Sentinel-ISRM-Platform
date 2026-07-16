import { env } from "../../../config/env";
import { AppError } from "../../../shared/AppError";
import { comparePassword } from "../../../shared/password";
import { hashToken, signAuthToken } from "../../../shared/jwt";
import {
  findUsuarioByOrganizacionYEmail,
  incrementarIntentosFallidos,
  resetearIntentosFallidos,
  bloquearUsuarioTemporalmente,
  crearSesion,
  revocarSesionPorTokenHash,
} from "../repository/auth.repository";
import { registrarEventoSeguridad } from "../../security-events/service/security-events.service";
import { LoginInput } from "../schema/auth.schema";
import { LoginResult } from "../types/auth.types";

/**
 * Política de bloqueo por intentos fallidos — INFORMACIÓN PENDIENTE DE
 * DEFINICIÓN (Constitución: "no inventar número máximo de intentos ni
 * tiempo de bloqueo"). El modelo (`Usuario.intentosFallidos`,
 * `Usuario.bloqueadoHasta`) soporta la funcionalidad, pero el umbral no está
 * definido en ningún documento fuente.
 *
 * No existen valores mágicos en este archivo: los umbrales se leen
 * exclusivamente de `env.AUTH_MAX_INTENTOS_FALLIDOS` y
 * `env.AUTH_BLOQUEO_MINUTOS` (ambos opcionales, sin default — ver
 * config/env.ts). Mientras no se configuren, la lógica de bloqueo queda
 * preparada pero inactiva: los intentos fallidos se siguen contando, pero
 * nunca se aplica un bloqueo hasta que exista una decisión oficial.
 */

const MENSAJE_CREDENCIALES_INVALIDAS = "Credenciales inválidas";

function parseExpiresInToMs(expiresIn: string): number {
  // Soporta el formato usado en .env.example (p. ej. "1h", "15m", "30s").
  const match = /^(\d+)(s|m|h|d)$/.exec(expiresIn.trim());
  if (!match) {
    const asNumber = Number(expiresIn);
    return Number.isFinite(asNumber) ? asNumber * 1000 : 3600 * 1000;
  }
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * unitMs[unit];
}

export async function login(input: LoginInput, direccionIp: string): Promise<LoginResult> {
  const usuario = await findUsuarioByOrganizacionYEmail(input.organizacion, input.email);

  // Mensaje genérico e idéntico sin importar cuál dato es incorrecto
  // (organización, email o password), para no revelar cuál falló.
  if (!usuario) {
    await registrarEventoSeguridad({
      evento: "AUTH_LOGIN_FAILED",
      resultado: "FALLIDO",
      severidad: "ADVERTENCIA",
      direccionIp,
      descripcion: "Intento de login con organización o email inexistentes",
      detalles: { organizacion: input.organizacion, email: input.email },
    });
    throw new AppError(MENSAJE_CREDENCIALES_INVALIDAS, 401);
  }

  if (!usuario.activo) {
    await registrarEventoSeguridad({
      evento: "AUTH_LOGIN_FAILED",
      resultado: "FALLIDO",
      severidad: "ADVERTENCIA",
      direccionIp,
      descripcion: "Intento de login sobre un usuario inactivo",
      usuarioId: usuario.id,
      organizacionId: usuario.organizacionId,
    });
    throw new AppError(MENSAJE_CREDENCIALES_INVALIDAS, 401);
  }

  if (usuario.organizacion.estado !== "ACTIVA") {
    await registrarEventoSeguridad({
      evento: "AUTH_LOGIN_FAILED",
      resultado: "FALLIDO",
      severidad: "ALTA",
      direccionIp,
      descripcion: "Intento de login sobre una organización no activa",
      usuarioId: usuario.id,
      organizacionId: usuario.organizacionId,
      detalles: { estadoOrganizacion: usuario.organizacion.estado },
    });
    throw new AppError("La organización no se encuentra activa", 403);
  }

  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta.getTime() > Date.now()) {
    await registrarEventoSeguridad({
      evento: "AUTH_LOGIN_FAILED",
      resultado: "FALLIDO",
      severidad: "ALTA",
      direccionIp,
      descripcion: "Intento de login sobre una cuenta bloqueada temporalmente",
      usuarioId: usuario.id,
      organizacionId: usuario.organizacionId,
      detalles: { bloqueadoHasta: usuario.bloqueadoHasta },
    });
    throw new AppError(
      "Cuenta bloqueada temporalmente por múltiples intentos fallidos",
      423
    );
  }

  const passwordValida = await comparePassword(input.password, usuario.passwordHash);

  if (!passwordValida) {
    const intentosPrevios = usuario.intentosFallidos;
    await incrementarIntentosFallidos(usuario.id);

    // Bloqueo condicionado a que exista configuración explícita (ver nota
    // arriba). Sin ambas variables definidas, no se aplica ningún bloqueo.
    const maxIntentos = env.AUTH_MAX_INTENTOS_FALLIDOS;
    const minutosBloqueo = env.AUTH_BLOQUEO_MINUTOS;

    let disparaBloqueo = false;
    if (maxIntentos !== undefined && minutosBloqueo !== undefined) {
      if (intentosPrevios + 1 >= maxIntentos) {
        disparaBloqueo = true;
        await bloquearUsuarioTemporalmente(
          usuario.id,
          new Date(Date.now() + minutosBloqueo * 60 * 1000)
        );
      }
    }

    await registrarEventoSeguridad({
      evento: "AUTH_LOGIN_FAILED",
      resultado: "FALLIDO",
      // Sube a ALTA cuando este intento fue el que disparó el bloqueo de
      // cuenta — reutiliza el cálculo ya existente, no duplica la lógica.
      severidad: disparaBloqueo ? "ALTA" : "ADVERTENCIA",
      direccionIp,
      descripcion: disparaBloqueo
        ? "Password inválida — este intento provocó el bloqueo temporal de la cuenta"
        : "Password inválida",
      usuarioId: usuario.id,
      organizacionId: usuario.organizacionId,
    });

    throw new AppError(MENSAJE_CREDENCIALES_INVALIDAS, 401);
  }

  await resetearIntentosFallidos(usuario.id);

  const token = signAuthToken({
    sub: usuario.id,
    organizacionId: usuario.organizacionId,
    rolId: usuario.rolId,
  });

  const expiraEn = new Date(Date.now() + parseExpiresInToMs(env.JWT_EXPIRES_IN));

  await crearSesion({
    usuarioId: usuario.id,
    tokenHash: hashToken(token),
    expiraEn,
  });

  await registrarEventoSeguridad({
    evento: "AUTH_LOGIN_SUCCESS",
    resultado: "EXITO",
    severidad: "INFO",
    direccionIp,
    descripcion: "Login exitoso",
    usuarioId: usuario.id,
    organizacionId: usuario.organizacionId,
  });

  return { usuario, token, expiraEn };
}

export async function logout(
  token: string,
  actor: { usuarioId?: string; organizacionId?: string; direccionIp: string }
): Promise<void> {
  await revocarSesionPorTokenHash(hashToken(token));

  await registrarEventoSeguridad({
    evento: "AUTH_LOGOUT",
    resultado: "EXITO",
    severidad: "INFO",
    direccionIp: actor.direccionIp,
    descripcion: "Logout exitoso",
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
  });
}
