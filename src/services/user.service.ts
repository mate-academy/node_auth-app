import { User } from '@prisma/client';

export type NormalizedUser = {
  id: string;
  email: string;
  name: string | null;
};

export const normalize = ({ id, email, name }: User): NormalizedUser => {
  return {
    id,
    email,
    name,
  };
};

export const validateEmail = (email: string) => {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is invalid';
  }
};

export const validatePassword = (password: string) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
};

export const validateName = (name: string) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.trim().length < 1) {
    return 'Name cannot be empty';
  }
};
