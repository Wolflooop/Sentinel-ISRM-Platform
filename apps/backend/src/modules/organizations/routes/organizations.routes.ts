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
