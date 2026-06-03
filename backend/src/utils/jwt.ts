import jsonwebtoken from 'jsonwebtoken';
import { NormalizedUser } from './normalizeUser';

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not set');
  }
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not set');
  }
  return secret;
}

function generateAccessToken(user: NormalizedUser) {
  return jsonwebtoken.sign(user, getAccessSecret(), { expiresIn: '15min' });
}

function generateRefreshToken(user: NormalizedUser) {
  return jsonwebtoken.sign(user, getRefreshSecret(), { expiresIn: '7day' });
}

function validateAccessToken(token: string) {
  try {
    return jsonwebtoken.verify(token, getAccessSecret());
  } catch (error) {
    return null;
  }
}

function validateRefreshToken(token: string) {
  try {
    return jsonwebtoken.verify(token, getRefreshSecret());
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