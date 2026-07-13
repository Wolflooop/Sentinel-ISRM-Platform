import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/AppError";
import { findPermisosPorRol } from "../modules/auth/repository/auth.repository";

/**
 * Middleware RBAC (segundo eslabón de la cadena obligatoria). Debe ejecutarse
 * siempre después de `authenticate`, ya que depende de `req.user.rolId`.
 *
 * Consulta Rol → RolPermiso → Permiso (regla explícita de la Constitución)
 * para verificar que el rol del usuario autenticado tenga el permiso
 * requerido, expresado como par (recurso, accion).
 */
export function authorize(recurso: string, accion: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("No autenticado", 401);
      }

      const permisos = await findPermisosPorRol(req.user.rolId);

      const tienePermiso = permisos.some(
        (p) => p.recurso === recurso && p.accion === accion
      );

      if (!tienePermiso) {
        throw new AppError("Acceso denegado: permisos insuficientes", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
