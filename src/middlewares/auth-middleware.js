import { ApiError } from '../exceptions/API-error.js';
import { readAccessToken } from '../services/jwt-service.js';

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.sendStatus(401);
    return;
  }

  const [, accessToken] = auth.split(' ');

  if (!accessToken) {
    res.sendStatus(401);
    return;
  }

  const result = readAccessToken(accessToken);

  if (result === null) {
    throw ApiError.Unauthorized();
  }

  next();
};
