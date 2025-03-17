import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unAuthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.badRequest('Invalid access token', {
      accessToken: 'Invalid access token',
    });
  }

  const storedRefreshToken = await tokenService.getByUserId(userData.id);

  if (!storedRefreshToken) {
    throw ApiError.unAuthorized({
      message: 'Session expired. Please log in again.',
    });
  }

  req.user = userData;
  next();
};
