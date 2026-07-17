import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarContextosController,
  obtenerContextoActivoController,
  obtenerContextoController,
  crearContextoController,
  actualizarContextoController,
  reemplazarEscalaImpactoController,
  reemplazarEscalaProbabilidadController,
  reemplazarMatrizController,
  activarContextoController,
} from "../controller/context.controller";

const router = Router();

router.use(authenticate);


router.get("/activo", authorize("contexto", "leer"), obtenerContextoActivoController);
router.get("/", authorize("contexto", "leer"), listarContextosController);
router.get("/:id", authorize("contexto", "leer"), obtenerContextoController);

router.post("/", authorize("contexto", "crear"), crearContextoController);
router.patch("/:id", authorize("contexto", "actualizar"), actualizarContextoController);

router.put(
  "/:id/escalas-impacto",
  authorize("contexto", "actualizar"),
  reemplazarEscalaImpactoController
);
router.put(
  "/:id/escalas-probabilidad",
  authorize("contexto", "actualizar"),
  reemplazarEscalaProbabilidadController
);
router.put("/:id/matriz", authorize("contexto", "actualizar"), reemplazarMatrizController);

router.post("/:id/activar", authorize("contexto", "activar"), activarContextoController);

export { router as contextRouter };
