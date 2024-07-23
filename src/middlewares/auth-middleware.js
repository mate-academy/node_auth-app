import { ApiError } from '../exceptions/API-error.js';
import { verifyAccessToken } from '../services/jwt-service.js';

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    throw ApiError.Unauthorized();
  }

  const [, accessToken] = auth.split(' ');

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const result = verifyAccessToken(accessToken);

  if (result === null) {
    throw ApiError.Unauthorized();
  }

  next();
};
