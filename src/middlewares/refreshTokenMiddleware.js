import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const refreshTokenMiddleware = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw ApiError.unauthorized({ message: 'No refresh token provided' });
  }

  const refreshUserData = jwtService.verifyRefresh(refreshToken);
  if (!refreshUserData) {
    throw ApiError.unauthorized({ message: 'Invalid refresh token' });
  }

  next();
};
