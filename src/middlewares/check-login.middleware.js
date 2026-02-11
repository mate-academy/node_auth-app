import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

export const checkNotLoggedIn = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    logger.info('Already logged in user attempt', {
      userId: req.userId,
    });
    throw ApiError.forbidden();
  }
  next();
};
