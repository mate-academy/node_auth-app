import { z } from 'zod';
import { isPasswordValid } from '../lib/password.js';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .refine(isPasswordValid, 'Password does not meet the requirements'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const passwordResetConfirmSchema = z
  .object({
    password: z
      .string()
      .refine(isPasswordValid, 'Password does not meet the requirements'),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    message: 'Passwords do not match',
    path: ['confirmation'],
  });
