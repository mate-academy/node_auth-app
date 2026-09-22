import {
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { jwt } from '../utils/jwt';

import type { NormalizedUser } from '../services/user.service';

export interface AuthRequest extends ExpressRequest {
  user?: { id: number } | null;
}

export const authMiddleware = (
  req: AuthRequest,
  res: ExpressResponse,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwt.validateAccessToken(accessToken) as {
    id: number;
  } | null;

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  req.user = userData as NormalizedUser;
  next();
};
