import { Router } from "express";
import { loginController, logoutController } from "../controller/auth.controller";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

// Público — no pasa por el middleware JWT (todavía no existe sesión)
router.post("/login", loginController);

// Requiere sesión activa para poder revocarla
router.post("/logout", authenticate, logoutController);

export { router as authRouter };
