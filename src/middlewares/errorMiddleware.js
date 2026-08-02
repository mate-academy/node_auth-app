import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).send({
      message: error.message,
      errors: error.errors,
    });
  }

  return res.status(500).send({
    message: 'Server error',
  });
};
