import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarControlesController,
  obtenerControlController,
  crearControlController,
  actualizarControlController,
  eliminarControlController,
} from "../controller/controls.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("controles", "leer"), listarControlesController);
router.get("/:id", authorize("controles", "leer"), obtenerControlController);
router.post("/", authorize("controles", "crear"), crearControlController);
router.put("/:id", authorize("controles", "actualizar"), actualizarControlController);
router.delete("/:id", authorize("controles", "eliminar"), eliminarControlController);

export { router as controlsRouter };
