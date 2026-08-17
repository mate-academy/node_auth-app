import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const tokenParamsSchema = z.object({ token: z.string().min(1) });
const emptySchema = z.object({});

export const emptyRequestSchema = z.object({
  body: emptySchema,
  params: emptySchema,
  query: emptySchema,
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: passwordSchema,
  }),
  params: emptySchema,
  query: emptySchema,
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
  params: emptySchema,
  query: emptySchema,
});

export const logoutSchema = z.object({
  body: z.object({ refreshToken: z.string().min(1) }),
  params: emptySchema,
  query: emptySchema,
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().email() }),
  params: emptySchema,
  query: emptySchema,
});

export const resetPasswordSchema = z.object({
  body: z.object({ password: passwordSchema, confirmation: z.string().min(1) }),
  params: tokenParamsSchema,
  query: emptySchema,
});

export const refreshSchema = logoutSchema;

export const changeNameSchema = z.object({
  body: z.object({ name: z.string().trim().min(2) }),
  params: emptySchema,
  query: emptySchema,
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmation: z.string().min(1),
  }),
  params: emptySchema,
  query: emptySchema,
});

export const changeEmailSchema = z.object({
  body: z.object({
    password: z.string().min(1),
    newEmail: z.string().trim().toLowerCase().email(),
  }),
  params: emptySchema,
  query: emptySchema,
});

export const tokenSchema = z.object({
  body: emptySchema,
  params: tokenParamsSchema,
  query: emptySchema,
});
