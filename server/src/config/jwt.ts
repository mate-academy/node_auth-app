import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config';
import type { NormalizedAuthUser } from '../feature/User/utils.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const RESET_PASSWORD_SECRET = process.env.JWT_RESET_PASSWORD_SECRET as string;

function generateAccessToken(user: NormalizedAuthUser) {
  return jsonwebtoken.sign(user, ACCESS_SECRET, { expiresIn: '10s' });
}

function generateRefreshToken(user: NormalizedAuthUser) {
  return jsonwebtoken.sign(user, REFRESH_SECRET, { expiresIn: '15s' });
}

function generateResetPasswordToken(user: NormalizedAuthUser) {
  return jsonwebtoken.sign(user, RESET_PASSWORD_SECRET, { expiresIn: '7m' });
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

function validateResetPasswordToken(token: string) {
  try {
    return jsonwebtoken.verify(token, RESET_PASSWORD_SECRET);
  } catch (error) {
    return null;
  }
}

export const jwt = {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  validateAccessToken,
  validateRefreshToken,
  validateResetPasswordToken,
};
