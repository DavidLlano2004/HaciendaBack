import { Router } from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getPositionsByDepartment,
  searchDepartments,
  getDepartmentStatistics,
} from "../controllers/department.controller.js";

import { validateSchema } from "../middlewares/validateschema.middleware.js";
import { authRequired } from "../middlewares/validatetoken.middleware.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../schemas/department.schemas.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

// Basic CRUD
router.post(
  "/departments",
  validateSchema(createDepartmentSchema),
  createDepartment
);
router.get("/departments", getAllDepartments);
router.get("/departments/:id", getDepartmentById);
router.put(
  "/departments/:id",
  validateSchema(updateDepartmentSchema),
  updateDepartment
);
router.delete("/departments/:id", deleteDepartment);

// Additional routes
router.get("/departments/:id/positions", getPositionsByDepartment);

// Search
router.get("/departments/search", searchDepartments);

// Statistics
router.get("/departments/statistics/general", getDepartmentStatistics);

export default router;
