import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader) {
    throw ApiError.unauthorized();
  }

  if (!accessToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });
  }

  next();
}
