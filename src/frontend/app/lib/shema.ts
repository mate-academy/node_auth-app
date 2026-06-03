import { z } from 'zod';

export const PASSWORD_RULE_HINTS = [
  'At least 8 characters',
  'At least one uppercase letter (A–Z)',
  'At least one lowercase letter (a–z)',
  'At least one number (0–9)',
  'At least one special character (!@#$…)',
] as const;

export const PASSWORD_CHECKS = [
  {
    id: 'length',
    label: PASSWORD_RULE_HINTS[0],
    test: (value: string) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: PASSWORD_RULE_HINTS[1],
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: PASSWORD_RULE_HINTS[2],
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: PASSWORD_RULE_HINTS[3],
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: PASSWORD_RULE_HINTS[4],
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export function areAllPasswordRulesMet(value: string): boolean {
  return PASSWORD_CHECKS.every((rule) => rule.test(value));
}

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must include at least one special character',
  );

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
});

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  password: passwordSchema,
});

export const ProfileNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
});

export const ProfileEmailSchema = z
  .object({
    password: z.string().min(1, 'Password is required'),
    email: z.email('Enter a valid email address'),
    confirmEmail: z.email('Please confirm your new email'),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail'],
  });

export const ProfilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ResetSchema = z.object({
  email: z.email(),
});

export const ChangePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
