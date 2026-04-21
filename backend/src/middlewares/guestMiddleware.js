import { ApiError } from '../exceptions/ApiError.js';
import { jwtService } from '../services/jwtService.js';

export function guestMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    next();
    return;
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    next();
    return;
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (userData) {
    throw ApiError.BadRequest('Already authenticated');
  }

  next();
}
