import { Request, Response, NextFunction } from "express";
import { listarPermisos } from "../service/permissions.service";
import { toPermisoResponseListDTO } from "../mapper/permissions.mapper";

export async function listarPermisosController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const permisos = await listarPermisos();
    res.status(200).json(toPermisoResponseListDTO(permisos));
  } catch (err) {
    next(err);
  }
}
