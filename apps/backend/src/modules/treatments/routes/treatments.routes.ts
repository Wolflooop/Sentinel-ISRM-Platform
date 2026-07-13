import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarTratamientosController,
  obtenerTratamientoController,
  crearTratamientoController,
  actualizarTratamientoController,
} from "../controller/treatments.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarTratamientosController);
router.get("/:id", authorize("riesgos", "leer"), obtenerTratamientoController);
router.post("/", authorize("riesgos", "crear"), crearTratamientoController);
router.patch("/:id", authorize("riesgos", "actualizar"), actualizarTratamientoController);

export { router as treatmentsRouter };
