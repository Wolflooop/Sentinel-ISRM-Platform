/**
 * Error de aplicación con código HTTP explícito. El errorHandler global
 * (middleware/errorHandler.ts, ya existente desde la Fase 1) lee la
 * propiedad `status` de cualquier error lanzado.
 */
export class AppError extends Error {
  public readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
