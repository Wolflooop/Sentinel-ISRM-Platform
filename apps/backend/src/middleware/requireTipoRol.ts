import { Request, Response, NextFunction } from "express";
import { TipoRol } from "@prisma/client";
import { AppError } from "../shared/AppError";
import { registrarEventoSeguridad } from "../modules/security-events/service/security-events.service";

/**
 * Bloquea el acceso a menos que el usuario autenticado tenga uno de los
 * TipoRol indicados (SUPER_ADMIN, ADMIN_TIC, USUARIO_COMUN).
 *
 * Esto es INDEPENDIENTE del sistema de permisos por recurso/acción
 * (`authorize`): existen operaciones (crear organizaciones, crear
 * Administradores TIC, seleccionar la organización de un usuario nuevo)
 * que dependen del nivel jerárquico del rol y no de un permiso asignable
 * dinámicamente. Se usa junto a `authorize`, nunca en su lugar.
 *
 * Nunca confía en nada enviado por el frontend: el tipoRol viene siempre
 * del JWT verificado por `authenticate`, jamás del body de la petición.
 */
export function requireTipoRol(...tiposPermitidos: TipoRol[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("No autenticado", 401);
      }

      if (!tiposPermitidos.includes(req.user.tipoRol)) {
        await registrarEventoSeguridad({
          evento: "AUTH_ACCESS_DENIED",
          resultado: "FALLIDO",
          severidad: "ALTA",
          direccionIp: req.ip ?? "desconocida",
          descripcion:
            "Intento de acceso a una operación restringida por jerarquía de rol",
          usuarioId: req.user.sub,
          organizacionId: req.user.organizacionId,
          detalles: {
            tipoRolActual: req.user.tipoRol,
            tiposPermitidos,
            ruta: req.originalUrl,
          },
        });
        throw new AppError("Acceso denegado: jerarquía de rol insuficiente", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
