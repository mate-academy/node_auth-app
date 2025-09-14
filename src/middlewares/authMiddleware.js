import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'];

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(ApiError.unauthorized());
  }

  const token = authorization.split(' ')[1];

  try {
    const userData = jwtService.verify(token);

    if (!userData) {
      return next(ApiError.unauthorized());
    }

    req.user = userData;
    next();
  } catch (err) {
    return next(ApiError.unauthorized());
  }
};
