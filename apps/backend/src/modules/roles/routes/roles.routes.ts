import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  listarRolesController,
  obtenerRolController,
  obtenerPermisosDeRolController,
  crearRolController,
  actualizarRolController,
  asignarPermisoController,
  quitarPermisoController,
} from "../controller/roles.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("roles", "leer"), listarRolesController);
router.get("/:id", authorize("roles", "leer"), obtenerRolController);
router.get("/:id/permisos", authorize("roles", "leer"), obtenerPermisosDeRolController);
router.post("/", authorize("roles", "crear"), crearRolController);
router.patch("/:id", authorize("roles", "actualizar"), actualizarRolController);
router.post(
  "/:id/permisos",
  authorize("roles", "gestionarPermisos"),
  asignarPermisoController
);
router.delete(
  "/:id/permisos/:permisoId",
  authorize("roles", "gestionarPermisos"),
  quitarPermisoController
);

export { router as rolesRouter };
