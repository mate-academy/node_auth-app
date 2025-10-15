import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../utils/apiError.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return next(ApiError.notAuthorized());
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return next(ApiError.notAuthorized());
  }

  req.user = userData;

  next();
};
