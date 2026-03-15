import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';

import { ApiError } from '../exeptions/api.error.js';
import { jwt } from '../utils/jwt.js';
import { NormalizedUser } from '../services/user.service.js';

declare module 'express-serve-static-core' {
  // eslint-disable-next-line no-shadow
  interface Request {
    user?: NormalizedUser;
  }
}

export const authMiddleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction,
): void => {
  const authHeader = req.get('authorization') || '';

  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    throw ApiError.unauthorized('Token is required');
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized('Invalid token');
  }

  req.user = userData as NormalizedUser;

  next();
};
