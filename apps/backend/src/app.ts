import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { usersRouter } from "./modules/users/routes/users.routes";
import { rolesRouter } from "./modules/roles/routes/roles.routes";
import { permissionsRouter } from "./modules/permissions/routes/permissions.routes";
import { organizationsRouter } from "./modules/organizations/routes/organizations.routes";
import { contextRouter } from "./modules/context/routes/context.routes";
import { assetsRouter } from "./modules/assets/routes/assets.routes";
import { threatsRouter } from "./modules/threats/routes/threats.routes";
import { vulnerabilitiesRouter } from "./modules/vulnerabilities/routes/vulnerabilities.routes";
import { risksRouter } from "./modules/risks/routes/risks.routes";
import { evaluationsRouter } from "./modules/evaluations/routes/evaluations.routes";
import { treatmentsRouter } from "./modules/treatments/routes/treatments.routes";
import { controlsRouter } from "./modules/controls/routes/controls.routes";

/**
 * Construye y configura la aplicación Express.
 *
 * Fase 1 — Infraestructura base: solo se configuran middlewares transversales
 * de seguridad, logging y parsing. NO se registra ningún módulo funcional
 * (auth, activos, riesgos, etc.) — eso corresponde a fases posteriores, cada
 * una montada en app.use("/api/<recurso>", <router>) siguiendo la cadena
 * obligatoria: Route → JWT → RBAC → Zod → Controller → Service → Repository.
 */
export function createApp(): Application {
  const app = express();

  // Seguridad de cabeceras HTTP
  app.use(helmet());

  // CORS restringido al origen del frontend configurado
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Límite de tasa de peticiones (protección básica ante abuso/DoS)
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Parsing de body JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging HTTP
  app.use(requestLogger);

  // Endpoint de verificación de salud (infraestructura, no es un módulo de negocio)
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "sentinel-isrm-backend",
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // Módulos funcionales
  // ==========================================================================
  app.use("/api/auth", authRouter);
  app.use("/api/usuarios", usersRouter);
  app.use("/api/roles", rolesRouter);
  app.use("/api/permisos", permissionsRouter);
  app.use("/api/organizaciones", organizationsRouter);
  app.use("/api/contexto", contextRouter);
  app.use("/api/activos", assetsRouter);
  app.use("/api/amenazas", threatsRouter);
  app.use("/api/vulnerabilidades", vulnerabilitiesRouter);
  app.use("/api/riesgos", risksRouter);
  app.use("/api/evaluaciones", evaluationsRouter);
  app.use("/api/tratamientos", treatmentsRouter);
  app.use("/api/controles", controlsRouter);
  // Fase 10 en adelante (Tratamientos, ...), siguiendo el orden
  // oficial de desarrollo (Constitución, Sección 13)
  // ==========================================================================

  // 404 para cualquier ruta no reconocida
  app.use(notFoundHandler);

  // Manejo global de errores (debe ser el último middleware registrado)
  app.use(errorHandler);

  return app;
}
