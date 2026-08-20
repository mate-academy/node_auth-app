import jwt from 'jsonwebtoken';
import { AppError } from '../core/AppError.js';
import { extractBearerToken } from '../utils/jwt.js';

const authenticate = (req, res, next) => {
  const authorizationHeader = req.header('authorization');

  const token = extractBearerToken(authorizationHeader);

  try {
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SIGNATURE);

    req.user = data;
    next();
  } catch (error) {
    throw new AppError(
      'Invalid or expired token. Please log in again.',
      401,
      error,
    );
  }
};

export { authenticate };
