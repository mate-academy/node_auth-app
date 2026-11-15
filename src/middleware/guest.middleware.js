import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

// Lets only NOT authenticated users through
// (registration, activation, login, password reset).
export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (token && jwtService.verifyAccess(token)) {
    throw ApiError.forbidden('You are already logged in');
  }

  next();
};
