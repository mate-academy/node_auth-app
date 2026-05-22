import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { jwt } from '../utils/jwt.js';

export function authMiddleware(
  req: ExpressRequest,
  res: ExpressResponse,
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

  (req as any).user = userData;

  next();
}
