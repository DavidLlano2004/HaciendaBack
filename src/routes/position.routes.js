import { Router } from "express";
import {
  createPosition,
  getAllPositions,
  getPositionById,
  getPositionsByDepartment,
  updatePosition,
  deletePosition,
  getEmployeesByPosition,
  searchPositions,
} from "../controllers/position.controller.js";

import { authRequired } from "../middlewares/validatetoken.middleware.js";
import { validateSchema } from "../middlewares/validateschema.middleware.js";
import {
  createPositionSchema,
  updatePositionSchema,
} from "../schemas/position.schemas.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

// Basic CRUD
router.post("/positions", validateSchema(createPositionSchema), createPosition);
router.get("/positions", getAllPositions);
router.get("/positions/:id", getPositionById);
router.put(
  "/positions/:id",
  validateSchema(updatePositionSchema),
  updatePosition
);
router.delete("/positions/:id", deletePosition);

// Additional routes
router.get("/positions/department/:id_department", getPositionsByDepartment);
router.get("/positions/:id/employees", getEmployeesByPosition);

// Search
router.get("/positions/search", searchPositions);

export default router;
