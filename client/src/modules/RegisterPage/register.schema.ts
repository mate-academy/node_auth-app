import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .nonempty({ message: 'Name is required' })
      .pipe(
        z
          .string()
          .min(3, 'Username must be at least 3 character long')
          .max(32, 'Username is too long'),
      ),
    email: z
      .string()
      .trim()
      .nonempty({ message: 'Email is required' })
      .pipe(z.email({ message: 'Email is invalid' })),
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

type RegisterFormData = z.infer<typeof registerSchema>;

export { registerSchema, type RegisterFormData };
