import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.unauthorized({
      email: 'User unauthorized',
    });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);
    return;
  }

  next();
};
