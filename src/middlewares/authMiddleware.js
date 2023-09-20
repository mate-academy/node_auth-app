
import { jwtService } from '../services/jwtService.js';
import { ApiError } from '../exeptions/apiError.js';

export function authMiddleware(req, res, next) {
  const authorization = req.headers['authorization'];
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  next();
};
