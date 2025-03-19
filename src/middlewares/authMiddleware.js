import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.header('authorization') || '';
  const [, token] = authorization.split(' ');
  const userData = jwtService.verify(token);

  const errors = {
    authorization: !authorization
      ? 'Authorization header is required'
      : undefined,
    token: authorization
      ? !token
        ? 'Token is required'
        : undefined
      : undefined,
    userData: token ? (!userData ? 'Invalid token' : undefined) : undefined,
  };

  if (errors.authorization || errors.token || errors.userData) {
    throw ApiError.unauthorized({ errors });
  }

  next();
};
