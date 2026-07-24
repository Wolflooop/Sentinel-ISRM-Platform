import { Request, Response, NextFunction } from "express";
import { obtenerIndicadoresGlobales } from "../service/dashboard.service";
import { toIndicadoresGlobalesResponseDTO } from "../mapper/dashboard.mapper";

export async function obtenerIndicadoresGlobalesController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const indicadores = await obtenerIndicadoresGlobales();
    res.status(200).json(toIndicadoresGlobalesResponseDTO(indicadores));
  } catch (err) {
    next(err);
  }
}
