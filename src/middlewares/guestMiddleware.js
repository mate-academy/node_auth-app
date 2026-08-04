import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    next();

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    next();

    return;
  }

  next(
    ApiError.forbidden(
      'This action is available only for non-authenticated users',
    ),
  );
};
