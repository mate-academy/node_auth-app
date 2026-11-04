import jwt from 'jsonwebtoken';
// eslint-disable-next-line no-shadow
import crypto from 'crypto';
import { RefreshToken } from '../model/refreshToken.model.js';
import 'dotenv/config';
import { sha256 } from '../utils/tokenHasher.js';

export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const generateAccessToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const verifyAccessToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return null;
  }
};

export const generateRefreshToken = async (userId) => {
  await removeAllUserTokens(userId);

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

  if (Date.now() >= refreshToken.expiresAt.getTime()) {
    await removeRefreshToken(token);

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
