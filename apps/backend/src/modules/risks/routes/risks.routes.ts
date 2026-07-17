import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarRiesgosController,
  obtenerRiesgoController,
  crearRiesgoController,
} from "../controller/risks.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarRiesgosController);
router.get("/:id", authorize("riesgos", "leer"), obtenerRiesgoController);
router.post("/", authorize("riesgos", "crear"), crearRiesgoController);


export { router as risksRouter };
