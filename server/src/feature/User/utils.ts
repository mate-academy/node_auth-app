import type { User } from '../../models/User.model.js';
import type { Response } from 'express';
import bcrypt from 'bcrypt';

export type NormalizedAuthUser = ReturnType<typeof normalizeAuth>;

export function normalizeAuth({ id, email }: User) {
  return { id, email };
}

export function normalizeUser({ id, name, email }: User) {
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

// export const checkPassword = async (res: Response, user: User | null, password: string) => {
//   if (!user) {
//     res.status(401).json({ message: 'Unauthorized' });
//     return false;
//   }

//   const isPasswordValid = await bcrypt.compare(password, user?.password || '');

//   if (!isPasswordValid) {
//     res.status(400).json({ message: 'Invalid password' });
//     return false;
//   }

//   return true;
// };
