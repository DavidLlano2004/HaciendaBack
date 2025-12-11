import { z } from "zod";

// Schema for create attendance
export const createAttendanceSchema = z.object({
  id_employee: z
    .string({
      required_error: "Employee ID is required",
    })
    .uuid({
      message: "Employee ID must be a valid UUID",
    }),
  date: z
    .string({
      required_error: "Date is required",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD format",
    }),
  entry_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Entry time must be in HH:MM or HH:MM:SS format",
    })
    .optional(),
  exit_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Exit time must be in HH:MM or HH:MM:SS format",
    })
    .optional(),
  status: z
    .enum(["present", "absent", "late", "justified"], {
      invalid_type_error: "Status must be present, absent, late or justified",
    })
    .optional()
    .default("present"),
  observations: z.string().max(500).optional(),
});

// Schema for update attendance
export const updateAttendanceSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD format",
    })
    .optional(),
  entry_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Entry time must be in HH:MM or HH:MM:SS format",
    })
    .optional()
    .nullable(),
  exit_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Exit time must be in HH:MM or HH:MM:SS format",
    })
    .optional()
    .nullable(),
  status: z
    .enum(["present", "absent", "late", "justified"], {
      invalid_type_error: "Status must be present, absent, late or justified",
    })
    .optional(),
  observations: z.string().max(500).optional().nullable(),
});

// Schema for register entry
export const registerEntrySchema = z.object({
  id_employee: z
    .string({
      required_error: "Employee ID is required",
    })
    .uuid({
      message: "Employee ID must be a valid UUID",
    }),
  date: z
    .string({
      required_error: "Date is required",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD format",
    }),
  entry_time: z
    .string({
      required_error: "Entry time is required",
    })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Entry time must be in HH:MM or HH:MM:SS format",
    }),
});

// Schema for register exit
export const registerExitSchema = z.object({
  exit_time: z
    .string({
      required_error: "Exit time is required",
    })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: "Exit time must be in HH:MM or HH:MM:SS format",
    }),
});

// Schema for date range filter
export const dateRangeSchema = z.object({
  start_date: z
    .string({
      required_error: "Start date is required",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Start date must be in YYYY-MM-DD format",
    }),
  end_date: z
    .string({
      required_error: "End date is required",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "End date must be in YYYY-MM-DD format",
    }),
});

// Schema for status filter
export const statusFilterSchema = z.object({
  status: z.enum(["present", "absent", "late", "justified"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be present, absent, late or justified",
  }),
});

// Schema for search
export const searchAttendanceSchema = z.object({
  q: z
    .string({
      required_error: "Search parameter is required",
    })
    .min(1, {
      message: "Search parameter cannot be empty",
    })
    .trim(),
});