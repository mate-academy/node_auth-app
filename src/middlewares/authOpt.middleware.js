import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authOpt(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (payload && typeof payload === 'object' && payload.id) {
      req.user = {
        id: payload.id,
        email: payload.email,
      };
    }
  } catch {}

  next();
}
