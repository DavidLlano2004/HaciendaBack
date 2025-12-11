import { Router } from "express";
import {
  createCamp,
  getAllCamps,
  getCampById,
  getCampsByEmployee,
  getCampsByStatus,
  updateCamp,
  deleteCamp,
  searchCamps,
  assignEmployee,
  removeEmployee,
  getCampStatistics,
} from "../controllers/camp.controller.js";
import { authRequired } from "../middlewares/validatetoken.middleware.js";
import { validateSchema } from "../middlewares/validateschema.middleware.js";
import {
  createCampSchema,
  updateCampSchema,
  assignEmployeeSchema,
  statusFilterSchema,
} from "../schemas/camp.schemas.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

// Basic CRUD
router.post("/camps", validateSchema(createCampSchema), createCamp);
router.get("/camps", getAllCamps);
router.get("/camps/:id", getCampById);
router.put("/camps/:id", validateSchema(updateCampSchema), updateCamp);
router.delete("/camps/:id", deleteCamp);

// Employee management
router.post("/camps/:id/assign-employee", validateSchema(assignEmployeeSchema), assignEmployee);
router.delete("/camps/:id/remove-employee", removeEmployee);

// Filters
router.get("/camps/employee/:id_employee", getCampsByEmployee);
router.get("/camps/status/:status", getCampsByStatus);

// Search
router.get("/camps/search", searchCamps);

// Statistics
router.get("/camps/statistics/general", getCampStatistics);

export default router;