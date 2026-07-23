import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiters";

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
import { riskIdentificationCategoriesRouter } from "./modules/risk-identification-categories/routes/risk-identification-categories.routes";
import { evaluationsRouter } from "./modules/evaluations/routes/evaluations.routes";
import { treatmentsRouter } from "./modules/treatments/routes/treatments.routes";
import { controlsRouter } from "./modules/controls/routes/controls.routes";
import { riskResolutionsRouter } from "./modules/risk-resolutions/routes/risk-resolutions.routes";
import { commentsRouter } from "./modules/comments/routes/comments.routes";
import { followUpsRouter } from "./modules/follow-ups/routes/follow-ups.routes";
import { evidenceRouter } from "./modules/evidence/routes/evidence.routes";
import { reportsRouter } from "./modules/reports/routes/reports.routes";
import { auditRouter } from "./modules/audit/routes/audit.routes";
import { securityEventsRouter } from "./modules/security-events/routes/security-events.routes";


export function createApp(): Application {

  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      service: "sentinel-isrm-backend",
      timestamp: new Date().toISOString(),
    });
  });

  /*
   * Rate limiting general para TODO /api/*.
   * Se monta ANTES de los routers para dar protección base,
   * incluida /api/auth (que además tiene su authLimiter
   * propio por-ruta dentro de auth.routes.ts, solo en /login).
   */
  app.use("/api", apiLimiter);

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
  app.use(
    "/api/categorias-identificacion-riesgo",
    riskIdentificationCategoriesRouter
  );

  app.use("/api/evaluaciones", evaluationsRouter);
  app.use("/api/tratamientos", treatmentsRouter);
  app.use("/api/controles", controlsRouter);

  app.use(
    "/api/resoluciones-riesgo",
    riskResolutionsRouter
  );

  app.use("/api/comentarios", commentsRouter);
  app.use("/api/seguimientos", followUpsRouter);
  app.use("/api/evidencias", evidenceRouter);

  app.use("/api/reportes", reportsRouter);
  app.use("/api/auditoria", auditRouter);
  app.use(
    "/api/eventos-seguridad",
    securityEventsRouter
  );

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}