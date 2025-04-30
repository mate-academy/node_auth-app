import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../types/NormalizedUser.js';

const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY as string;
const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY as string;

function generateAccessToken(normalizedUser: NormalizedUser) {
  return jsonwebtoken.sign(normalizedUser, JWT_ACCESS_KEY, {
    expiresIn: '10m',
  });
}

function validateAccessToken(accessToken: string) {
  try {
    return jsonwebtoken.verify(accessToken, JWT_ACCESS_KEY);
  } catch (_) {}
}

function generateRefreshToken(normalizedUser: NormalizedUser) {
  return jsonwebtoken.sign(normalizedUser, JWT_REFRESH_KEY, {
    expiresIn: '7d',
  });
}

function validateRefreshToken(accessToken: string) {
  try {
    return jsonwebtoken.verify(accessToken, JWT_REFRESH_KEY);
  } catch (_) {}
}

export const jwt = {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
};
