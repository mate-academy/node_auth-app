import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters'),

  email: z.string().trim().email('Invalid email address'),

  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),

  password: z.string().min(1, 'Password is required'),
});
