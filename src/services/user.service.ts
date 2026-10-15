import { User } from '../models/user.js';

export type NormalizedUser = {
  id: number;
  email: string;
  name: string;
};

function validateName(name: unknown) {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }
}

function validateEmail(email: unknown) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (typeof email !== 'string' || !email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

export const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, message: 'At least 8 characters' },
  {
    test: (p: string) => /[a-z]/.test(p),
    message: 'At least one lowercase letter',
  },
  {
    test: (p: string) => /[A-Z]/.test(p),
    message: 'At least one uppercase letter',
  },
  { test: (p: string) => /\d/.test(p), message: 'At least one digit' },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    message: 'At least one special character',
  },
];

const passwordRules = PASSWORD_RULES.map((rule) => rule.message);

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || !password) {
    return 'Password is required';
  }

  const failed = PASSWORD_RULES.filter((rule) => !rule.test(password));

  if (failed.length > 0) {
    return failed.map((rule) => rule.message).join('. ');
  }
}

function validatePasswordConfirmation(
  password: unknown,
  confirmation: unknown,
) {
  if (password !== confirmation) {
    return 'Passwords do not match';
  }
}

function normalize({ id, email, name }: User) {
  return { id, email, name };
}

function findByEmail(email: unknown) {
  if (typeof email !== 'string') {
    return Promise.resolve(null);
  }

  return User.findOne({ where: { email: email.trim().toLowerCase() } });
}

export const userService = {
  validateName,
  validateEmail,
  validatePassword,
  normalize,
  findByEmail,
  passwordRules,
  validatePasswordConfirmation,
};
