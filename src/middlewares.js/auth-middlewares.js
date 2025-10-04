import { verifyRefreshToken } from '../services/jwt-services.js';
import { ApiError } from '../exceptions.js/api-errors.js';

export const isAuthenticated = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(ApiError.Unauthorized());
  }

  try {
    const userData = verifyRefreshToken(refreshToken);

    if (!userData) {
      return next(ApiError.Unauthorized());
    }

    req.user = userData;
    next();
  } catch (err) {
    return next(ApiError.Unauthorized());
  }
};

export const isNotAuthenticated = (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next();
  }

  try {
    const userData = verifyRefreshToken(refreshToken);

    if (userData) {
      return next(ApiError.Forbidden('Already logged in'));
    }

    next();
  } catch {
    next();
  }
};
