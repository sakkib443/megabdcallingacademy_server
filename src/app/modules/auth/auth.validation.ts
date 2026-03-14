// src/app/modules/auth/auth.validation.ts
import { z } from 'zod';

export const loginValidationSchema = z.object({
  email: z.string({ required_error: 'User email is required' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters' }),
});