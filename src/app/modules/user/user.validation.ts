import { z } from "zod";

export const signupValidationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    phoneNumber: z.string().optional(),
    password: z
      .string()
      .min(4, { message: "Password should be at least 4 characters" })
      .max(20, { message: "Password should not exceed 20 characters" }),
    role: z.enum(['superAdmin', 'admin', 'trainingManager', 'mentor', 'student', 'parent']).default('student'),
    status: z.enum(['active', 'blocked', 'pending']).default('active'),
  }),
});

export const googleLoginValidationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional().default(''),
    email: z.string().email(),
    image: z.string().optional(),
    googleId: z.string().min(1),
  }),
});

// Keep old schema for backward compat
export const userValidationSchema = z.object({
  body: z.object({
    id: z.string().min(1, { message: "ID is required" }).optional(),
    password: z
      .string()
      .min(4, { message: "Password should be at least 4 characters" })
      .max(20, { message: "Password should not exceed 20 characters" }),
    isPasswordChanged: z.boolean().optional(),
    role: z.enum(['superAdmin', 'admin', 'trainingManager', 'mentor', 'student', 'parent']),
    status: z.enum(['active', 'blocked', 'pending']).optional(),
    isDeleted: z.boolean().optional(),
  }),
});
