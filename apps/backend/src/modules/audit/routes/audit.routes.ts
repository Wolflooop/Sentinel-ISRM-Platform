import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarRegistrosAuditoriaController,
  obtenerRegistroAuditoriaController,
} from "../controller/audit.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("auditoria", "leer"), listarRegistrosAuditoriaController);
router.get("/:id", authorize("auditoria", "leer"), obtenerRegistroAuditoriaController);

export { router as auditRouter };
