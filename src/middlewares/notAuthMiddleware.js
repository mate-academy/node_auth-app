'use strict';

import { ApiError } from '../exceptions/api.error.js';
import jwtService from '../services/jwt.service.js';
import userService from '../services/user.service.js';

export const notAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization?.split(' ');

  if (token) {
    const userData = jwtService.verifyAccessToken(token);

    if (userData) {
      throw ApiError.forbidden('User is authorized already', {
        user: userService.normalize(userData),
      });
    }
  }

  next();
};
