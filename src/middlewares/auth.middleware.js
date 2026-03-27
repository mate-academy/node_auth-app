import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Authorization header missing or malformed');

    return next(ApiError.unauthorized());
  }

  const token = authHeader.split(' ')[1];
  const userData = jwtService.verify(token);

  if (!userData) {
    logger.error('Invalid or expired token');

    return next(ApiError.unauthorized());
  }

  req.userId = userData.id;
  next();
};

export const storeLinkIntent = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    logger.warn('No refresh token found');

    return next(ApiError.unauthorized());
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    return next(ApiError.unauthorized());
  }

  req.session.linkUserId = userData.id;
  req.session.socialAuthIntent = 'link';

  req.session.save((err) => {
    if (err) {
      return next(err);
    }

    next();
  });
};
