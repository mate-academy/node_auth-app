import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, request, response, next) => {
  if (error instanceof ApiError) {
    response.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  response.statusCode = 500;

  response.send({
    message: 'Server error',
  });
};
