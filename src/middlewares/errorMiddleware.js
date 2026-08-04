import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).send({
      message: error.message || 'Server error',
      errors: error.errors || {},
    });
  }

  return res.status(500).send({
    message: 'Server error',
  });
};
