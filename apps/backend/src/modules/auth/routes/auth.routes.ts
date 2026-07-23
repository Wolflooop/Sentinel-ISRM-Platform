import { Router } from "express";
import {
  loginController,
  logoutController,
  perfilActualController,
} from "../controller/auth.controller";
import { authenticate } from "../../../middleware/authenticate";
import { authLimiter } from "../../../middleware/rateLimiters";

const router = Router();

router.post("/login", authLimiter, loginController);

router.post("/logout", authenticate, logoutController);

router.get("/me", authenticate, perfilActualController);

export { router as authRouter };