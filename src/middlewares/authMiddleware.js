import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';

  // gets a token as a second argument
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  req.user = userData;

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
