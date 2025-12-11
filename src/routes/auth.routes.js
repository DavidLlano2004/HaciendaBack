import { Router } from "express";
import {
  login,
  register,
  logout,
  verifyToken,
  getProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { loginSchema, registerSchema, changePasswordSchema } from "../schemas/user.schemas.js";
import { authRequired } from "../middlewares/validatetoken.middleware.js";
import { validateSchema } from "../middlewares/validateschema.middleware.js";

const router = Router();

// Public routes
router.post("/auth/login", validateSchema(loginSchema), login);
router.post("/auth/register", validateSchema(registerSchema), register);
router.post("/auth/verify", verifyToken);

// Protected routes
router.post("/auth/logout", authRequired, logout);
router.get("/auth/profile", authRequired, getProfile);
router.post("/auth/change-password", authRequired, validateSchema(changePasswordSchema), changePassword);

export default router;