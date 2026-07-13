import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
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
router.post("/", authorize("usuarios", "crear"), crearUsuarioController);
router.patch("/:id", authorize("usuarios", "actualizar"), actualizarUsuarioController);
router.patch(
  "/:id/estado",
  authorize("usuarios", "cambiarEstado"),
  cambiarEstadoUsuarioController
);

export { router as usersRouter };
