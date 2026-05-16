import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';
import { validateAccessToken } from '../utils/jwt.js';

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const [type, headerToken] = authHeader?.split(' ') || [];

  const token =
    type === 'Bearer' && headerToken ? headerToken : req.cookies?.accessToken;

  if (!token) {
    throw new AppError(401, 'Unauthorized');
  }

  const userData = validateAccessToken(token);

  if (!userData) {
    throw new AppError(401, 'Invalid or expired token');
  }

  req.user = userData;

  next();
};
