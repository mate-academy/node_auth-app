import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'node:crypto';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_TTL_MS =
  Number(process.env.REFRESH_TOKEN_TTL_DAYS) * 24 * 60 * 60 * 1000;

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

export function generateOpaqueToken() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}

export function setRefreshTokenCookie(res, token) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/auth',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

export function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/auth',
  });
}

export function getRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
}
