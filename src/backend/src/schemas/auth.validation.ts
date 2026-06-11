import z from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid Email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(3).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid Email'),
  password: z.string().min(1, 'Password are required'),
});

export const activationSchema = z.object({
  token: z.string().min(64, 'Invalid token format'), // 32 байти у hex мають довжину 64 символи
});

export const updateNameSchema = z.object({
  newName: z.string().min(3, 'Name must be at least 3 characters'),
});

export const updateEmailSchema = z.object({
  newEmail: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(64, 'Invalid token format'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
