import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;

const changePasswordSchema = z.object({
  body: z.object({
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
  }),
});

const changeNameSchema = z.object({
  body: z.object({
    newName: z
      .string()
      .trim()
      .nonempty({ message: 'Name is required' })
      .pipe(
        z
          .string()
          .min(3, 'Username must be at least 3 character long')
          .max(32, 'Username is too long'),
      ),
  }),
});

const requestEmailChangeSchema = z.object({
  body: z.object({
    newEmail: z
      .string()
      .trim()
      .nonempty({ message: 'Email is required' })
      .pipe(z.email({ message: 'Email is invalid' })),
    password: z.string().nonempty({ message: 'Password is required' }),
  }),
});

const confirmEmailChangeSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export {
  changePasswordSchema,
  changeNameSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
};
