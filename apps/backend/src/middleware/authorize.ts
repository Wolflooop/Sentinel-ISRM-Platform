import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/AppError";
import { findPermisosPorRol } from "../modules/auth/repository/auth.repository";
import { registrarEventoSeguridad } from "../modules/security-events/service/security-events.service";


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
        await registrarEventoSeguridad({
          evento: "AUTH_ACCESS_DENIED",
          resultado: "FALLIDO",
          severidad: "ADVERTENCIA",
          direccionIp: req.ip ?? "desconocida",
          descripcion: "Acceso denegado: el rol del usuario no tiene el permiso requerido",
          usuarioId: req.user.sub,
          organizacionId: req.user.organizacionId,
          detalles: { recurso, accion, ruta: req.originalUrl },
        });
        throw new AppError("Acceso denegado: permisos insuficientes", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
