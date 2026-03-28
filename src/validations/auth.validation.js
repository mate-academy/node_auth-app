import { z } from 'zod';

const nameField = z.string().min(1, 'Name is required');
const emailField = z.email('Email is not valid');
const passwordField = z.string().min(6, 'At least 6 characters');

const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

const requestPasswordResetSchema = z.object({
  email: emailField,
});

const confirmPasswordResetSchema = z
  .object({
    password: passwordField,
    confirmation: passwordField,
  })
  .refine((data) => data.password === data.confirmation, {
    message: 'Confirmation and password do not match',
    path: ['confirmation'],
  });

const updateNameSchema = z.object({
  name: nameField,
});

const requestEmailChangeSchema = z.object({
  newEmail: emailField,
  password: passwordField,
});

const updatePasswordSchema = z
  .object({
    password: passwordField.optional(),
    newPassword: passwordField,
    confirmation: passwordField,
  })
  .refine((data) => data.newPassword === data.confirmation, {
    message: 'Confirmation and new password do not match',
    path: ['confirmation'],
  });

export const authValidation = {
  register: { body: registerSchema },
  login: { body: loginSchema },
  requestPasswordReset: { body: requestPasswordResetSchema },
  confirmPasswordReset: {
    body: confirmPasswordResetSchema,
  },
  updateName: { body: updateNameSchema },
  requestEmailChange: { body: requestEmailChangeSchema },
  updatePassword: { body: updatePasswordSchema },
};
