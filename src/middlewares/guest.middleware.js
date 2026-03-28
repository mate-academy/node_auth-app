import { jwtService } from '../services/jwt.service.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/api.error.js';

export const isNotAuth = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    logger.info('No refresh token found, proceeding to guest route');

    return next();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    logger.info('Invalid refresh token, proceeding to guest route');

    return next();
  }

  return next(ApiError.badRequest('Already authenticated'));
};
