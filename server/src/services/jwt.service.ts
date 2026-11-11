import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type TokenPayload = { id: number; email: string };

function signAccess(payload: TokenPayload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: '15m' });
}

function signRefresh(payload: TokenPayload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: '30d' });
}

function verify(token: string, secret: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch {
    return null;
  }
}

export const jwtService = {
  signAccess,
  signRefresh,
  verifyAccess: (token: string) => verify(token, env.jwt.accessSecret),
  verifyRefresh: (token: string) => verify(token, env.jwt.refreshSecret),
};
