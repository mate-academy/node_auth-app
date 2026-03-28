import { ApiError } from '../utils/api.error.js';

export const notFound = (req, res, next) => {
  return next(ApiError.notFound('Route not found'));
};
