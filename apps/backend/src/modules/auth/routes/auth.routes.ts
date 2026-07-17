import { Router } from "express";
import {
  loginController,
  logoutController,
  perfilActualController,
} from "../controller/auth.controller";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

// Público — no pasa por el middleware JWT (todavía no existe sesión)
router.post("/login", loginController);

// Requiere sesión activa para poder revocarla
router.post("/logout", authenticate, logoutController);

// Lectura de lo propio: solo requiere sesión válida, no un permiso RBAC
// adicional (ver nota en perfilActualController).
router.get("/me", authenticate, perfilActualController);

export { router as authRouter };
