import 'dotenv/config';
import type { NormalizedUser } from '../types/index.js';
import pkg from 'jsonwebtoken';
import type ms from 'ms';

const { sign, verify } = pkg;

const accessSecret = process.env.ACCESS_SECRET as string;
const refreshSecret = process.env.REFRESH_SECRET as string;

function wrap(callback: (...args: any) => any) {
  try {
    return callback();
  } catch (err) {
    return null;
  }
}

const generateAccessToken = (normalizedUser: NormalizedUser) => {
  return wrap(() => sign(
    normalizedUser,
    accessSecret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as ms.StringValue || '5s' }
  ));
};

const validateAccessToken = (token: string) => {
  return wrap(() => {
    return verify(token, accessSecret);
  });
}

const generateRefreshToken = (normalizedUser: NormalizedUser) => {
  return wrap(() => sign(
    normalizedUser,
    refreshSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as ms.StringValue || '30d'}
  ));
};

const validateRefreshToken = (token: string) => {
  return wrap(() => verify(token, refreshSecret));
}

export {
  generateAccessToken,
  validateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
}

