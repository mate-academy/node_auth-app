import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty({ message: 'Password is required' })
      .pipe(
        z
          .string()
          .min(8, 'Password must be at least 8 characters long')
          .max(64, 'Password is too long')
          .regex(
            passwordRegex,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          ),
      ),
    confirmPassword: z
      .string()
      .nonempty({ message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export { resetPasswordSchema, type ResetPasswordFormData };
