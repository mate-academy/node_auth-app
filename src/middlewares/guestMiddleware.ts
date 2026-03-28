import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { tokenService } from '../services/tokenService.js';

export function guestMiddleware(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      return next();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);

    if (userData) {
      return response.redirect('/user/profile');
    }

    next();
  } catch (error) {
    next();
  }
}
