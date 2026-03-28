import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { ApiError } from '../exceptions/ApiError.js';
import { tokenService } from '../services/tokenService.js';
import { isNormalizedUser } from '../types/User.js';

export function authMiddleware(
  request: ExpressRequest,
  response: ExpressResponse,
  next: NextFunction,
) {
  try {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      throw ApiError.Unauthorized();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);

    if (!userData || !isNormalizedUser(userData)) {
      throw ApiError.Unauthorized();
    }

    request.user = userData;

    next();
  } catch {
    next(ApiError.Unauthorized());
  }
}
