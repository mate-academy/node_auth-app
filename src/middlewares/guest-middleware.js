import { ApiError } from '../exceptions/API-error.js';

export const guestMiddleware = (req, res, next) => {
  const auth = req.headers?.authorization;

  if (auth) {
    throw ApiError.Unauthorized();
  }

  next();
  return;
};
