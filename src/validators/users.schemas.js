import { z } from 'zod';
import { isPasswordValid } from '../lib/password.js';

export const updateNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .refine(isPasswordValid, 'Password does not meet the requirements'),
    confirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmation, {
    message: 'Passwords do not match',
    path: ['confirmation'],
  });

export const changeEmailSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  newEmail: z.string().email('Enter a valid email'),
});
