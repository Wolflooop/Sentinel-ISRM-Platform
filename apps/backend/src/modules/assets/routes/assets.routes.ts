import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarActivosController,
  listarCategoriasController,
  obtenerActivoController,
  crearActivoController,
  actualizarActivoController,
  cambiarEstadoActivoController,
} from "../controller/assets.controller";

const router = Router();

router.use(authenticate);

router.get("/categorias", authorize("activos", "leer"), listarCategoriasController);
router.get("/", authorize("activos", "leer"), listarActivosController);
router.get("/:id", authorize("activos", "leer"), obtenerActivoController);

router.post("/", authorize("activos", "crear"), crearActivoController);
router.patch("/:id", authorize("activos", "actualizar"), actualizarActivoController);
router.patch(
  "/:id/estado",
  authorize("activos", "cambiarEstado"),
  cambiarEstadoActivoController
);

export { router as assetsRouter };
