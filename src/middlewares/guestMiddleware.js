import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const isGuest = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const refreshToken = req.cookies?.refreshToken;

  if (!authHeader && !refreshToken) {
    return next();
  }

  if (authHeader?.startsWith('Bearer ')) {
    const [, accessToken] = authHeader.split(' ');

    if (accessToken) {
      const accessData = jwtService.verify(accessToken);

      if (accessData) {
        return next(ApiError.badRequest('You are already logged in'));
      }
    }
  }

  if (refreshToken) {
    const refreshData = jwtService.verifyRefresh(refreshToken);

    if (refreshData) {
      return next(ApiError.badRequest('You are already logged in'));
    }
  }

  return next();
};
