import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { listarPermisosController } from "../controller/permissions.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("permisos", "leer"), listarPermisosController);

export { router as permissionsRouter };
