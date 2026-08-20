import { z } from 'zod';

const profileEmailSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .nonempty({ message: 'Email is required' })
    .pipe(z.email({ message: 'Email is invalid' })),
  password: z.string().nonempty({ message: 'Password is required' }),
});

type ProfileEmailFormData = z.infer<typeof profileEmailSchema>;

export { profileEmailSchema, type ProfileEmailFormData };
