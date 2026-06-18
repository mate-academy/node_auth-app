import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unAuthorized({});
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unAuthorized({});
  }

  req.user = userData;

  return next();
};
