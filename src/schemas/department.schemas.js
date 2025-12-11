import { z } from "zod";

// Schema for create department
export const createDepartmentSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(2, {
      message: "Name must be at least 2 characters",
    })
    .max(100, {
      message: "Name cannot exceed 100 characters",
    })
    .trim(),
  description: z
    .string()
    .max(500, {
      message: "Description cannot exceed 500 characters",
    })
    .optional()
    .nullable(),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Status must be active or inactive",
    })
    .optional()
    .default("active"),
});

// Schema for update department
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters",
    })
    .max(100, {
      message: "Name cannot exceed 100 characters",
    })
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, {
      message: "Description cannot exceed 500 characters",
    })
    .optional()
    .nullable(),
  status: z
    .enum(["active", "inactive", "deleted"], {
      invalid_type_error: "Status must be active, inactive or deleted",
    })
    .optional(),
});

// Schema for search
export const searchDepartmentSchema = z.object({
  q: z
    .string({
      required_error: "Search parameter is required",
    })
    .min(1, {
      message: "Search parameter cannot be empty",
    })
    .trim(),
});