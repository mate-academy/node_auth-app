'use strict';

import { ApiError } from '../exceptions/api.error.js';
import jwtService from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization?.split(' ');

  if (!authorization) {
    throw ApiError.unauthorized({
      message: 'There are no authorization header',
    });
  }

  if (!token) {
    throw ApiError.unauthorized({
      message: 'There are no token in authorization header',
    });
  }

  const userData = jwtService.verifyAccessToken(token);

  if (!userData) {
    throw ApiError.unauthorized({
      message: 'Invalid token',
    });
  }

  next();
};
