import { ApiError } from '../exeptions/apiError.js';
import jwtService from '../services/jwt.service.js';

export const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.verifyAccessToken(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }
  req.userId = userData.id;
  next();
};
