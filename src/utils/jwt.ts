import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../services/user.service.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export const generateAccessToken = (user: NormalizedUser) => {
  return jsonwebtoken.sign(user, ACCESS_SECRET, { expiresIn: '10m' });
};

export const validateAccessToken = (token: string): NormalizedUser | null => {
  try {
    return jsonwebtoken.verify(token, ACCESS_SECRET) as NormalizedUser;
  } catch (error) {
    return null;
  }
};

export const generateRefreshToken = (user: NormalizedUser) => {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
};

export const validateRefreshToken = (token: string): NormalizedUser | null => {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET) as NormalizedUser;
  } catch (error) {
    return null;
  }
};
