import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;

const profilePasswordSchema = z
  .object({
    previousPassword: z.string().min(1, 'Previous password is required'),
    newPassword: z
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfilePasswordFormData = z.infer<typeof profilePasswordSchema>;

export { profilePasswordSchema, type ProfilePasswordFormData };
