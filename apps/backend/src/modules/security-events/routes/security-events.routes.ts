import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarEventosSeguridadController,
  obtenerEventoSeguridadController,
} from "../controller/security-events.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("eventosSeguridad", "leer"), listarEventosSeguridadController);
router.get("/:id", authorize("eventosSeguridad", "leer"), obtenerEventoSeguridadController);

export { router as securityEventsRouter };
