import { User } from '../../models/User.model.js';

export type NormalizedAuthUser = {
  id: number;
  email: string;
};

export type NormalizedUser = {
  id: number;
  name: string;
  email: string;
};

export function normalizeAuth({ id, email }: User): NormalizedAuthUser {
  return { id, email };
}

export function normalizeUser({ id, name, email }: User): NormalizedUser {
  return { id, name, email };
}

export function validateEmail(email: string) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) return 'Email is required';
  if (!emailPattern.test(email)) return 'Email is not valid';
}

export function validatePassword(password: string) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'At least 6 characters';
}
