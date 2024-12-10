import { ApiError } from '../exeptions/api.error.js';
import { jwtService } from '../services/index.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const throwUnauthorizedError = () => {
    throw ApiError.unauthorized({
      user: 'unauthorized user',
    });
  };

  if (!authorization) {
    throwUnauthorizedError();
  }

  const [, token] = authorization?.split(' ');

  if (!token) {
    throwUnauthorizedError();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throwUnauthorizedError();
  }

  req.userId = userData.id;
  next();
};
