import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (authorization || token) {
    throw ApiError.badRequest('this function only for non authenticated users');
  }

  const userData = jwtService.verify(token);

  if (userData) {
    throw ApiError.badRequest('this function only for non authenticated users');
  }

  next();
};
