import { z } from "zod";

// Schema for create position
export const createPositionSchema = z.object({
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
  id_department: z
    .string({
      required_error: "Department ID is required",
    })
    .uuid({
      message: "Department ID must be a valid UUID",
    }),
  base_salary: z
    .number({
      invalid_type_error: "Base salary must be a number",
    })
    .min(0, {
      message: "Base salary must be greater than or equal to 0",
    })
    .optional()
    .default(0),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Status must be active or inactive",
    })
    .optional()
    .default("active"),
});

// Schema for update position
export const updatePositionSchema = z.object({
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
  id_department: z
    .string()
    .uuid({
      message: "Department ID must be a valid UUID",
    })
    .optional(),
  base_salary: z
    .number({
      invalid_type_error: "Base salary must be a number",
    })
    .min(0, {
      message: "Base salary must be greater than or equal to 0",
    })
    .optional(),
  status: z
    .enum(["active", "inactive", "deleted"], {
      invalid_type_error: "Status must be active, inactive or deleted",
    })
    .optional(),
});

// Schema for search
export const searchPositionSchema = z.object({
  q: z
    .string({
      required_error: "Search parameter is required",
    })
    .min(1, {
      message: "Search parameter cannot be empty",
    })
    .trim(),
});