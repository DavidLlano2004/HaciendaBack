import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import campRoutes from "./routes/camp.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import positionRoutes from "./routes/position.routes.js";

// Configure environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use(
  "/api",
  authRoutes,
  userRoutes,
  attendanceRoutes,
  campRoutes,
  departmentRoutes,
  positionRoutes
);

export default app;
