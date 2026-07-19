import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { requireTipoRol } from "../../../middleware/requireTipoRol";
import {
  obtenerOrganizacionActualController,
  actualizarOrganizacionActualController,
  cambiarEstadoOrganizacionActualController,
  crearOrganizacionController,
  listarOrganizacionesController,
} from "../controller/organizations.controller";

const router = Router();

router.use(authenticate);

// Administración global de organizaciones — exclusiva del Administrador
// Principal (SUPER_ADMIN). Un ADMIN_TIC no tiene acceso a este módulo en
// absoluto, tal como exige la especificación.
router.get(
  "/",
  requireTipoRol("SUPER_ADMIN"),
  authorize("organizaciones", "leer"),
  listarOrganizacionesController
);
router.post(
  "/",
  requireTipoRol("SUPER_ADMIN"),
  authorize("organizaciones", "crear"),
  crearOrganizacionController
);

// Autogestión de la propia organización — para ADMIN_TIC/USUARIO_COMUN.
// Un SUPER_ADMIN no tiene "organización actual" (organizacionId = null),
// así que estas rutas le devuelven 400 en el controller.
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
