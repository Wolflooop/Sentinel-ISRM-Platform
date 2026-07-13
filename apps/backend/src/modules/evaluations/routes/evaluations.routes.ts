import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarEvaluacionesController,
  obtenerEvaluacionController,
  crearEvaluacionController,
} from "../controller/evaluations.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarEvaluacionesController);
router.get("/:id", authorize("riesgos", "leer"), obtenerEvaluacionController);
router.post("/", authorize("riesgos", "crear"), crearEvaluacionController);

export { router as evaluationsRouter };
