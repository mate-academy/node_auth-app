import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { jwt } from '../utils/jwt.js';

export function guestMiddleware(
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction,
) {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const isValid = jwt.validateRefreshToken(refreshToken);

    if (isValid) {
      return res.status(400).json({ message: 'You are already authenticated' });
    }
  }

  next();
}
