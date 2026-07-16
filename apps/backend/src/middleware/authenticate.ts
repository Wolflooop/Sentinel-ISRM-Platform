import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAuthToken, hashToken, AuthTokenPayload } from "../shared/jwt";
import { AppError } from "../shared/AppError";
import { findSesionActivaPorTokenHash } from "../modules/auth/repository/auth.repository";
import { registrarEventoSeguridad } from "../modules/security-events/service/security-events.service";

/**
 * Middleware JWT (primer eslabón de la cadena obligatoria de la Constitución:
 * Route → JWT Middleware → RBAC Middleware → Zod Validation → Controller →
 * Service → Repository → Prisma → PostgreSQL).
 *
 * Verifica la firma/expiración del JWT y, además, que la Sesion asociada
 * exista y no haya sido revocada (logout) — el JWT por sí solo no puede
 * invalidarse antes de su expiración natural, por eso la revocación se
 * verifica contra la tabla Sesion en cada petición.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const direccionIp = req.ip ?? "desconocida";

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "ADVERTENCIA",
        direccionIp,
        descripcion: "Petición sin token de autenticación",
        detalles: { ruta: req.originalUrl },
      });
      throw new AppError("No autenticado: token no proporcionado", 401);
    }

    let payload: AuthTokenPayload;
    try {
      payload = verifyAuthToken(token);
    } catch (jwtErr) {
      if (jwtErr instanceof jwt.TokenExpiredError) {
        await registrarEventoSeguridad({
          evento: "AUTH_SESSION_EXPIRED",
          resultado: "FALLIDO",
          severidad: "INFO",
          direccionIp,
          descripcion: "Token JWT vencido",
          detalles: { ruta: req.originalUrl },
        });
      } else {
        // Firma inválida o token malformado — posible manipulación.
        await registrarEventoSeguridad({
          evento: "AUTH_ACCESS_DENIED",
          resultado: "FALLIDO",
          severidad: "ALTA",
          direccionIp,
          descripcion: "Token JWT inválido (firma o formato incorrectos)",
          detalles: { ruta: req.originalUrl },
        });
      }
      throw new AppError("Token inválido o expirado", 401);
    }

    const sesion = await findSesionActivaPorTokenHash(hashToken(token));

    if (!sesion) {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "ALTA",
        direccionIp,
        descripcion: "Token con firma válida pero sin sesión asociada en base de datos",
        usuarioId: payload.sub,
        organizacionId: payload.organizacionId,
        detalles: { ruta: req.originalUrl },
      });
      throw new AppError("Sesión inválida o revocada", 401);
    }

    if (sesion.revocado) {
      await registrarEventoSeguridad({
        evento: "AUTH_ACCESS_DENIED",
        resultado: "FALLIDO",
        severidad: "ADVERTENCIA",
        direccionIp,
        descripcion: "Intento de uso de una sesión ya revocada (logout previo)",
        usuarioId: payload.sub,
        organizacionId: payload.organizacionId,
        detalles: { ruta: req.originalUrl },
      });
      throw new AppError("Sesión inválida o revocada", 401);
    }

    if (sesion.expiraEn.getTime() < Date.now()) {
      await registrarEventoSeguridad({
        evento: "AUTH_SESSION_EXPIRED",
        resultado: "FALLIDO",
        severidad: "INFO",
        direccionIp,
        descripcion: "Sesión vencida en base de datos",
        usuarioId: payload.sub,
        organizacionId: payload.organizacionId,
        detalles: { ruta: req.originalUrl },
      });
      throw new AppError("Sesión expirada", 401);
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    // jsonwebtoken lanza sus propios errores (TokenExpiredError, JsonWebTokenError)
    next(new AppError("Token inválido o expirado", 401));
  }
}
