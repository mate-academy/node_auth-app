import type { Request, Response, NextFunction } from 'express';
import { jwt } from '../config/jwt.js';
import type { NormalizedAuthUser } from '../feature/User/utils.js';

export interface AuthRequest extends Request {
  user: NormalizedAuthUser
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).json({ message: 'Token is required' });
    return;
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  req.user = userData;

  next();
}
