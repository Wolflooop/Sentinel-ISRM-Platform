import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarVulnerabilidadesController,
  listarCategoriasController,
  obtenerVulnerabilidadController,
  crearVulnerabilidadController,
  actualizarVulnerabilidadController,
  eliminarVulnerabilidadController,
} from "../controller/vulnerabilities.controller";

const router = Router();

router.use(authenticate);

// "/categorias" debe declararse ANTES de "/:id" para que Express no lo
// confunda con un parámetro de ruta (mismo criterio ya usado en
// assets/context/threats).
router.get(
  "/categorias",
  authorize("vulnerabilidades", "leer"),
  listarCategoriasController
);
router.get("/", authorize("vulnerabilidades", "leer"), listarVulnerabilidadesController);
router.get("/:id", authorize("vulnerabilidades", "leer"), obtenerVulnerabilidadController);

router.post("/", authorize("vulnerabilidades", "crear"), crearVulnerabilidadController);
router.patch(
  "/:id",
  authorize("vulnerabilidades", "actualizar"),
  actualizarVulnerabilidadController
);
router.delete(
  "/:id",
  authorize("vulnerabilidades", "eliminar"),
  eliminarVulnerabilidadController
);

export { router as vulnerabilitiesRouter };
