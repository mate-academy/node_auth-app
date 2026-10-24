import jwt from 'jsonwebtoken';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import { RefreshToken } from '../model/refreshToken.model.js';
import 'dotenv/config';

export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sha256 = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
};

export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString('hex');

  await RefreshToken.create({
    userId,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  return token;
};

export const verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({
    where: { tokenHash: sha256(token) },
  });

  if (!refreshToken) {
    return null;
  }

  if (Date.now() >= refreshToken.expireAt.getTime()) {
    return null;
  }

  return refreshToken;
};

export const removeRefreshToken = (token) =>
  RefreshToken.destroy({ where: { tokenHash: sha256(token) } });

export const removeAllUserTokens = (userId) =>
  RefreshToken.destroy({ where: { userId } });

export const refreshAccessToken = async (token) => {
  const refreshToken = await verifyRefreshToken(token);

  if (!refreshToken) {
    return null;
  }

  const newToken = generateAccessToken(refreshToken.userId);

  return newToken;
};
