import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  // console.error('Error caught in middleware:', error);

  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).send({
    message: 'Server error',
  });
};
