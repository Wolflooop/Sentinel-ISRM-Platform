import { Request, Response, NextFunction } from "express";
import { verifyAuthToken, hashToken } from "../shared/jwt";
import { AppError } from "../shared/AppError";
import { findSesionActivaPorTokenHash } from "../modules/auth/repository/auth.repository";

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
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new AppError("No autenticado: token no proporcionado", 401);
    }

    const payload = verifyAuthToken(token);

    const sesion = await findSesionActivaPorTokenHash(hashToken(token));

    if (!sesion || sesion.revocado) {
      throw new AppError("Sesión inválida o revocada", 401);
    }

    if (sesion.expiraEn.getTime() < Date.now()) {
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
