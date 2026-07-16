import { Request, Response, NextFunction } from "express";
import { loginSchema } from "../schema/auth.schema";
import { login as loginService, logout as logoutService } from "../service/auth.service";
import { toLoginResponseDTO } from "../mapper/auth.mapper";
import { AppError } from "../../../shared/AppError";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginService(input, req.ip ?? "desconocida");
    res.status(200).json(toLoginResponseDTO(result));
  } catch (err) {
    next(err);
  }
}

export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new AppError("Token no proporcionado", 401);
    }

    // req.user está disponible: la ruta /auth/logout pasa por `authenticate`
    // antes de este controller (ver auth.routes.ts).
    await logoutService(token, {
      usuarioId: req.user?.sub,
      organizacionId: req.user?.organizacionId,
      direccionIp: req.ip ?? "desconocida",
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
