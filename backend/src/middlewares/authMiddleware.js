import { ApiError } from '../exceptions/ApiError.js';
import { jwtService } from '../services/jwtService.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.Unauthorized();
  }

  const [scheme, accessToken] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  req.user = userData;
  next();
}
