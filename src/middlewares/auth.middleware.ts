import type { RequestHandler } from 'express';
import { jwt } from '../utils/jwt.js';

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization ?? '';
  const [scheme, accessToken] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !accessToken) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid or expired token' });

    return;
  }

  res.locals.user = userData;

  next();
};
