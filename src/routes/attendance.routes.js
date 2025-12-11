import { Router } from "express";
import {
  createAttendance,
  getAllAttendances,
  getAttendanceById,
  getAttendancesByEmployee,
  getAttendancesByDate,
  getAttendancesByDateRange,
  getAttendancesByStatus,
  registerEntry,
  registerExit,
  updateAttendance,
  deleteAttendance,
  searchAttendances,
  getGeneralStatistics,
  getStatisticsByEmployee,
  getStatisticsByDateRange,
} from "../controllers/attendance.controller.js";
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  registerEntrySchema,
  registerExitSchema,
  dateRangeSchema,
  statusFilterSchema,
} from "../schemas/attendance.schemas.js";
import { validateSchema } from "../middlewares/validateschema.middleware.js";
import { authRequired } from "../middlewares/validatetoken.middleware.js";

const router = Router();

// All routes require authentication
router.use(authRequired);

// Basic CRUD
router.post(
  "/attendances",
  validateSchema(createAttendanceSchema),
  createAttendance
);
router.get("/attendances", getAllAttendances);
router.get("/attendances/:id", getAttendanceById);
router.put(
  "/attendances/:id",
  validateSchema(updateAttendanceSchema),
  updateAttendance
);
router.delete("/attendances/:id", deleteAttendance);

// Entry and Exit registration
router.post(
  "/attendances/entry",
  validateSchema(registerEntrySchema),
  registerEntry
);
router.post(
  "/attendances/:id/exit",
  validateSchema(registerExitSchema),
  registerExit
);

// Filters
router.get("/attendances/employee/:id_employee", getAttendancesByEmployee);
router.get("/attendances/date/:date", getAttendancesByDate);
router.get("/attendances/date-range", getAttendancesByDateRange);
router.get("/attendances/status/:status", getAttendancesByStatus);

// Search
router.get("/attendances/search", searchAttendances);

// Statistics
router.get("/attendances/statistics/general", getGeneralStatistics);
router.get(
  "/attendances/statistics/employee/:id_employee",
  getStatisticsByEmployee
);
router.get("/attendances/statistics/date-range", getStatisticsByDateRange);

export default router;
