import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from '../services/user.service.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

function generateAccessToken(user: NormalizedUser) {
  return jsonwebtoken.sign(user, ACCESS_SECRET, { expiresIn: '10m' });
}

function generateRefreshToken(user: NormalizedUser) {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
}

function validateAccessToken(token: string) {
  try {
    return jsonwebtoken.verify(token, ACCESS_SECRET);
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token: string) {
  try {
    return jsonwebtoken.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwt = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
