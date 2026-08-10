import { ApiError } from '../exceptions/ApiError.js';
import { jwtService } from '../services/jwtService.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw ApiError.Unauthorized();
  }

  const [, accesToken] = authHeader.split(' ');

  if (!accesToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accesToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next();
}
