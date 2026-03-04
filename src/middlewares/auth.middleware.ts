import { Request, Response, NextFunction } from 'express';
import * as jwt from '../utils/jwt.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};
