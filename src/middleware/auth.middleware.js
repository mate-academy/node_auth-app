import { ApiError } from '../exceptions/api.error.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader?.split(' ')[1] || req.cookies.accessToken;

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  req.user = userData;
  next();
};
