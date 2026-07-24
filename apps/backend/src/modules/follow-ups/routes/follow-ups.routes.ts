import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { listarSeguimientosController, crearSeguimientoController } from "../controller/follow-ups.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarSeguimientosController);
router.post("/", authorize("seguimientos", "crear"), crearSeguimientoController);

export { router as followUpsRouter };
