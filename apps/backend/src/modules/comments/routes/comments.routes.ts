import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { listarComentariosController, crearComentarioController } from "../controller/comments.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("riesgos", "leer"), listarComentariosController);
router.post("/", authorize("riesgos", "actualizar"), crearComentarioController);

export { router as commentsRouter };
