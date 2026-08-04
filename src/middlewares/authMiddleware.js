import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  const [type, token] = authorization.split(' ');

  if (!type || type !== 'Bearer' || !token) {
    next(ApiError.unauthorized());

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    next(ApiError.unauthorized());

    return;
  }

  req.user = userData;

  next();
};
