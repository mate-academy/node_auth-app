import { z } from 'zod';

export const activateSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const resetRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changeProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const changeEmailSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  newEmail: z.string().email('Valid email is required'),
});
