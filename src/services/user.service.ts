import { User } from '@prisma/client';

export interface NormalizedUser {
  id: string;
  email: string;
  name?: string;
}

function normalize({ id, email, name }: User): NormalizedUser {
  return { id, email, name: name || undefined };
}

function validateEmail(email: string) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }

  return null;
}

function validatePassword(password: string) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }

  return null;
}

function validateName(name: string) {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }

  return null;
}

export const userService = {
  normalize,
  validateEmail,
  validatePassword,
  validateName,
};
