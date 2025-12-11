import { z } from "zod";

// Schema for create camp
export const createCampSchema = z.object({
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
  id_employee: z
    .string()
    .uuid({
      message: "Employee ID must be a valid UUID",
    })
    .optional()
    .nullable(),
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

// Schema for update camp
export const updateCampSchema = z.object({
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
  id_employee: z
    .string()
    .uuid({
      message: "Employee ID must be a valid UUID",
    })
    .optional()
    .nullable(),
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
    .optional(),
});

// Schema for assign employee
export const assignEmployeeSchema = z.object({
  id_employee: z
    .string({
      required_error: "Employee ID is required",
    })
    .uuid({
      message: "Employee ID must be a valid UUID",
    }),
});

// Schema for status filter
export const statusFilterSchema = z.object({
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be active or inactive",
  }),
});

// Schema for search
export const searchCampSchema = z.object({
  q: z
    .string({
      required_error: "Search parameter is required",
    })
    .min(1, {
      message: "Search parameter cannot be empty",
    })
    .trim(),
});