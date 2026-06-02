import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    return next();
  }

  const userData = jwtService.verify(token);

  if (userData) {
    throw ApiError.badRequest(
      'This function is only for non-authenticated users',
    );
  }

  next();
};
