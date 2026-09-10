import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .min(1, "Email address cannot be empty")
    .email("Please enter a valid email address (e.g. user@gmail.com)"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["Patient", "Ophthalmologist"]).default("Patient"),
});

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters long")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z
    .string({ required_error: "Email address is required" })
    .min(1, "Email address cannot be empty")
    .email("Please enter a valid email address (e.g. doctor@hospital.org)"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["Patient", "Ophthalmologist"], {
    required_error: "Please select an account role",
  }),
});
