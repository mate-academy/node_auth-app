import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';
import type { NormalizedAuthUser } from '../feature/User/utils.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET as string;

function generateAccessToken(user: NormalizedAuthUser): string {
  return jsonwebtoken.sign(user, ACCESS_SECRET, { expiresIn: '10m' });
}

function generateRefreshToken(user: NormalizedAuthUser): string {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
}

function generateResetPasswordToken(user: NormalizedAuthUser): string {
  return jsonwebtoken.sign(user, RESET_PASSWORD_SECRET, { expiresIn: '7m' });
}

function validateToken(token: string, secretKey: string) {
  try {
    const userData = jsonwebtoken.verify(token, secretKey);

    return typeof userData === 'string'
      ? null
      : userData as NormalizedAuthUser;
  } catch (error) {
    return null;
  }
}

function validateAccessToken(token: string): NormalizedAuthUser | null {
  return validateToken(token, ACCESS_SECRET);
}

function validateRefreshToken(token: string): NormalizedAuthUser | null {
  return validateToken(token, REFRESH_SECRET);
}

function validateResetPasswordToken(token: string): NormalizedAuthUser | null {
  return validateToken(token, RESET_PASSWORD_SECRET);
}

export const jwt = {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  validateAccessToken,
  validateRefreshToken,
  validateResetPasswordToken,
};
