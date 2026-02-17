import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const [, token] = authHeader.split(' ');

  if (!authHeader || !token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  req.user = userData;

  next();
};
