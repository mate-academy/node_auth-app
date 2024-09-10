import 'dotenv/config';
import { verifyAccessToken } from '../services/jwt-serwices.js';
import { ApiError } from '../exeptions/api-error.js';

/* eslint-disable no-console */
export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    res.status(401).send();

    return;
  }

  const [, token] = auth.split(' ');

  if (!auth) {
    throw ApiError.Unauthorized();
  }

  const data = verifyAccessToken(token);

  if (data === null) {
    throw ApiError.Unauthorized();
  }

  next();
};
