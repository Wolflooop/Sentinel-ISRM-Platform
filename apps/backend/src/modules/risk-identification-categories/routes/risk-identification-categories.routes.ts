import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarCategoriasIdentificacionController,
  obtenerCategoriaIdentificacionController,
  crearCategoriaIdentificacionController,
  actualizarCategoriaIdentificacionController,
  eliminarCategoriaIdentificacionController,
} from "../controller/risk-identification-categories.controller";

const router = Router();

router.use(authenticate);

// V2 (punto 2 del prompt): catálogo interno con CRUD propio, usado por
// Riesgo.categoriaIdentificacionId cuando origen = MANUAL.
router.get("/", authorize("riesgos", "leer"), listarCategoriasIdentificacionController);
router.get("/:id", authorize("riesgos", "leer"), obtenerCategoriaIdentificacionController);
router.post("/", authorize("riesgos", "crear"), crearCategoriaIdentificacionController);
router.patch("/:id", authorize("riesgos", "actualizar"), actualizarCategoriaIdentificacionController);
router.delete("/:id", authorize("riesgos", "eliminar"), eliminarCategoriaIdentificacionController);

export { router as riskIdentificationCategoriesRouter };
