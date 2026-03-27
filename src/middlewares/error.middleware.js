import { ApiError } from '../utils/api.error.js';
import { logger } from '../utils/logger.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .send({ message: error.message, errors: error.errors });
  }

  logger.error('Unexpected error', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).send({ message: 'Internal Server Error' });
};
