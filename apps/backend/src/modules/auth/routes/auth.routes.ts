import { Router } from "express";
import {
  loginController,
  logoutController,
  perfilActualController,
} from "../controller/auth.controller";
import { authenticate } from "../../../middleware/authenticate";

const router = Router();

router.post("/login", loginController);

router.post("/logout", authenticate, logoutController);

router.get("/me", authenticate, perfilActualController);

export { router as authRouter };
