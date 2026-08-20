import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .pipe(z.email({ message: 'Email is invalid' })),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export { forgotPasswordSchema, type ForgotPasswordFormData };
