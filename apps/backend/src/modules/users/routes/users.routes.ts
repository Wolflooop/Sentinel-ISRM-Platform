import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { requireTipoRol } from "../../../middleware/requireTipoRol";
import {
  listarUsuariosController,
  obtenerUsuarioController,
  crearUsuarioController,
  actualizarUsuarioController,
  cambiarEstadoUsuarioController,
} from "../controller/users.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("usuarios", "leer"), listarUsuariosController);
router.get("/:id", authorize("usuarios", "leer"), obtenerUsuarioController);
router.post(
  "/",
  authorize("usuarios", "crear"),
  // USUARIO_COMUN nunca puede crear usuarios, sin importar qué permisos de
  // recurso tenga asignados en el catálogo de roles.
  requireTipoRol("SUPER_ADMIN", "ADMIN_TIC"),
  crearUsuarioController
);
router.patch("/:id", authorize("usuarios", "actualizar"), actualizarUsuarioController);
router.patch(
  "/:id/estado",
  authorize("usuarios", "cambiarEstado"),
  cambiarEstadoUsuarioController
);

export { router as usersRouter };
