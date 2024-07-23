import { ApiError } from '../exceptions/API-error.js';
import { verifyAccessToken } from '../services/jwt-service.js';
import { parseAccessToken } from '../utils/parseAccessToken.js';

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  const headers = req.headers;

  console.log('headers:'.headers);

  console.log('auth (middleware):', auth);

  if (!auth) {
    console.log('---------1 auth-middleware-------');
    throw ApiError.Unauthorized();
  }

  const accessToken = parseAccessToken(auth);

  if (!accessToken) {
    console.log('---------2-------');
    throw ApiError.Unauthorized();
  }

  const result = verifyAccessToken(accessToken);

  if (result === null) {
    console.log('---------3-------');
    throw ApiError.Unauthorized();
  }

  next();
};
