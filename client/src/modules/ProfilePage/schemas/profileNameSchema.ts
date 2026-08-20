import { z } from 'zod';

const profileNameSchema  = z.object({
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
});

type ProfileNameFormData = z.infer<typeof profileNameSchema>;

export { profileNameSchema, type ProfileNameFormData };
