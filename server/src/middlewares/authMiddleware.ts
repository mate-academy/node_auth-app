import { RequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';
import { jwtService } from '../services/jwt.service';

export const authMiddleware: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const [type, token] = header?.split(' ') ?? [];

  if (type !== 'Bearer' || !token) {
    throw ApiError.unauthorized();
  }

  const payload = jwtService.verifyAccess(token);

  if (!payload) {
    throw ApiError.unauthorized();
  }

  req.user = payload;
  next();
};
