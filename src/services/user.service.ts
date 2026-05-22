import { User } from '@prisma/client';

function normalize(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export type NormalizedUser = ReturnType<typeof normalize>;

function validateEmail(email: string): string | void {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password: string): string | void {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

export const userService = {
  normalize,
  validateEmail,
  validatePassword,
};
