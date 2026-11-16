import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    throw ApiError.unauthorized('User not authorized');
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    throw ApiError.unauthorized('Token not found');
  }

  const userData = jwtService.verifyAccess(token);

  if (!userData) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  req.user = userData;
  next();
};
