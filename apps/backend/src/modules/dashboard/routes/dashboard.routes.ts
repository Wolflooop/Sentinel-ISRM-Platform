import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { requireTipoRol } from "../../../middleware/requireTipoRol";
import { obtenerIndicadoresGlobalesController } from "../controller/dashboard.controller";

const router = Router();

router.use(authenticate);

// Administración global de la plataforma — exclusiva del Administrador
// Principal (SUPER_ADMIN), igual que /organizaciones. Doble barrera:
// requireTipoRol (jerarquía) + authorize (permiso de recurso/acción), tal
// como el resto de módulos administrativos globales.
router.get(
  "/global",
  requireTipoRol("SUPER_ADMIN"),
  authorize("dashboard", "leer"),
  obtenerIndicadoresGlobalesController
);

export { router as dashboardRouter };
