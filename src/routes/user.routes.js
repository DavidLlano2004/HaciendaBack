import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  searchUsers,
  updateProfile,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
} from "../schemas/user.schemas.js";
import { authRequired } from "../middlewares/validatetoken.middleware.js";
import { validateSchema } from "../middlewares/validateschema.middleware.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

// Basic CRUD
router.post("/users", validateSchema(createUserSchema), createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", validateSchema(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);

// Additional routes
router.get("/users/role/:role", getUsersByRole);
router.get("/users/search", searchUsers);

// Authenticated user profile
router.put("/profile", validateSchema(updateProfileSchema), updateProfile);

export default router;