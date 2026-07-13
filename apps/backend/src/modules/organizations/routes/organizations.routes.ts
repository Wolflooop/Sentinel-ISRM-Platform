import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  obtenerOrganizacionActualController,
  actualizarOrganizacionActualController,
  cambiarEstadoOrganizacionActualController,
} from "../controller/organizations.controller";

const router = Router();

router.use(authenticate);

/**
 * Sin rutas `:id` — Fase 4 aprobada limita el módulo a autogestión de la
 * propia organización, resuelta siempre desde `req.user.organizacionId`.
 * No existen GET /, GET /:id, POST / ni DELETE /:id (pendientes de
 * definición: ver Constitución, Sección 3.3, sobre el mecanismo de
 * onboarding de nuevos tenants).
 */
router.get("/actual", authorize("organizaciones", "leer"), obtenerOrganizacionActualController);
router.patch(
  "/actual",
  authorize("organizaciones", "actualizar"),
  actualizarOrganizacionActualController
);
router.patch(
  "/actual/estado",
  authorize("organizaciones", "cambiarEstado"),
  cambiarEstadoOrganizacionActualController
);

export { router as organizationsRouter };
