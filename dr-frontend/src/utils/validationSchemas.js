import { z } from "zod";

export const roleEnum = z.enum(["Patient", "PHC Worker", "Ophthalmologist"], {
  errorMap: () => ({ message: "Please select a valid role (Patient, PHC Worker, or Doctor)." }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address (e.g. name@hospital.org)."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long."),
  role: roleEnum,
  honeypot: z.string().max(0, "Bot submission detected.").optional().or(z.literal("")),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full Name must be at least 2 characters.")
    .max(80, "Name cannot exceed 80 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address (e.g. name@hospital.org)."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password is too long."),
  role: roleEnum,
  honeypot: z.string().max(0, "Bot submission detected.").optional().or(z.literal("")),
});

export const patientIntakeSchema = z.object({
  patient_name: z.string().trim().min(2, "Patient name is required."),
  age: z
    .number({ invalid_type_error: "Age must be a valid number." })
    .int("Age must be an integer.")
    .min(1, "Age must be at least 1.")
    .max(120, "Age cannot exceed 120."),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender." }),
  }),
  eye_side: z.enum(["Left", "Right", "Both"]).optional(),
  phone: z
    .string()
    .regex(/^[0-9+ ]{10,15}$/, "Please enter a valid 10-digit mobile number.")
    .optional()
    .or(z.literal("")),
});

export const clinicalNoteSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(5, "Clinical note must be at least 5 characters.")
    .max(2000, "Clinical note cannot exceed 2000 characters."),
  recommendation: z.string().optional(),
});
