import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }
  res.locals.user = userData;

  next();
}
