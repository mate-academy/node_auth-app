import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      errors: error.errors,
      message: error.message,
    });

    return;
  }

  res.statusCode = 500;

  res.json({
    error,
    message: 'Server error',
  });
};
