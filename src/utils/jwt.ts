import 'dotenv/config';
import jwt from 'jsonwebtoken';
import type { NormalizedUser } from '../modules/users/users.service.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
}

export const generateAccessToken = (user: NormalizedUser): string => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const validateAccessToken = (token: string): NormalizedUser | null => {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    const { id, name, email, isActivated } = payload;

    if (
      typeof id !== 'number' ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof isActivated !== 'boolean'
    ) {
      return null;
    }

    return {
      id,
      name,
      email,
      isActivated,
    };
  } catch {
    return null;
  }
};
