import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarResolucionesController,
  crearResolucionController,
} from "../controller/risk-resolutions.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarResolucionesController);
router.post("/", authorize("riesgos", "actualizar"), crearResolucionController);

export { router as riskResolutionsRouter };
