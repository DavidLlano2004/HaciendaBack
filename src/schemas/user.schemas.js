import { z } from "zod";

// Schema for login
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Must be a valid email",
    })
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters",
    }),
});

// Schema for register
export const registerSchema = z.object({
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
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Must be a valid email",
    })
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters",
    })
    .max(50, {
      message: "Password cannot exceed 50 characters",
    }),
  role: z
    .enum(["employee", "admin", "client"], {
      invalid_type_error: "Role must be employee, admin or client",
    })
    .optional()
    .default("client"),
});

// Schema for create user (admin only)
export const createUserSchema = z.object({
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
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Must be a valid email",
    })
    .trim()
    .toLowerCase(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters",
    })
    .max(50, {
      message: "Password cannot exceed 50 characters",
    }),
  role: z.enum(["employee", "admin", "client"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be employee, admin or client",
  }),
  status: z
    .enum(["active", "inactive"], {
      invalid_type_error: "Status must be active or inactive",
    })
    .optional()
    .default("active"),
});

// Schema for update user
export const updateUserSchema = z.object({
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
  email: z
    .string()
    .email({
      message: "Must be a valid email",
    })
    .trim()
    .toLowerCase()
    .optional(),
  role: z
    .enum(["employee", "admin", "client"], {
      invalid_type_error: "Role must be employee, admin or client",
    })
    .optional(),
  status: z
    .enum(["active", "inactive", "deleted"], {
      invalid_type_error: "Status must be active, inactive or deleted",
    })
    .optional(),
});

// Schema for update profile (without changing role)
export const updateProfileSchema = z.object({
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
  email: z
    .string()
    .email({
      message: "Must be a valid email",
    })
    .trim()
    .toLowerCase()
    .optional(),
});

// Schema for change password
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: "Current password is required",
    })
    .min(1, {
      message: "Current password is required",
    }),
  newPassword: z
    .string({
      required_error: "New password is required",
    })
    .min(6, {
      message: "New password must be at least 6 characters",
    })
    .max(50, {
      message: "New password cannot exceed 50 characters",
    }),
});

// Schema for search
export const searchUserSchema = z.object({
  q: z
    .string({
      required_error: "Search parameter is required",
    })
    .min(1, {
      message: "Search parameter cannot be empty",
    })
    .trim(),
});

// Schema for filter by role
export const roleFilterSchema = z.object({
  role: z.enum(["employee", "admin", "client"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be employee, admin or client",
  }),
});