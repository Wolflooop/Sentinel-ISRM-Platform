import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import {
  generarReporteController,
  listarReportesController,
  descargarReporteController,
} from "../controller/reports.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize("reportes", "leer"), listarReportesController);
router.post("/", authorize("reportes", "crear"), generarReporteController);
router.get("/:id/descargar", authorize("reportes", "leer"), descargarReporteController);

export { router as reportsRouter };
