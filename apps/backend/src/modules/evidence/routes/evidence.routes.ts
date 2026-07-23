import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { uploadEvidencia } from "../../../middleware/uploadEvidencia";
import {
  listarEvidenciasController,
  crearEvidenciaController,
  validarEvidenciaController,
  descargarEvidenciaController,
} from "../controller/evidence.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarEvidenciasController);
router.get("/:id/descargar", authorize("riesgos", "leer"), descargarEvidenciaController);
router.post("/", authorize("riesgos", "actualizar"), uploadEvidencia, crearEvidenciaController);
router.patch("/:id/validar", authorize("riesgos", "actualizar"), validarEvidenciaController);

export { router as evidenceRouter };
