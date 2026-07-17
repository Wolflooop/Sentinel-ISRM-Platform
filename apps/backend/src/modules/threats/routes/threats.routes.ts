import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarAmenazasController,
  listarCategoriasController,
  obtenerAmenazaController,
  crearAmenazaController,
  actualizarAmenazaController,
  eliminarAmenazaController,
} from "../controller/threats.controller";

const router = Router();

router.use(authenticate);


router.get("/categorias", authorize("amenazas", "leer"), listarCategoriasController);
router.get("/", authorize("amenazas", "leer"), listarAmenazasController);
router.get("/:id", authorize("amenazas", "leer"), obtenerAmenazaController);

router.post("/", authorize("amenazas", "crear"), crearAmenazaController);
router.patch("/:id", authorize("amenazas", "actualizar"), actualizarAmenazaController);
router.delete("/:id", authorize("amenazas", "eliminar"), eliminarAmenazaController);

export { router as threatsRouter };
