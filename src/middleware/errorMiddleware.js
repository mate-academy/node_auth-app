import { ApiError } from '../exeptions/apiError.js';

export const errorMiddleware = (error, request, response, next) => {
  if (error instanceof ApiError) {
    return response.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  return response.status(500).send({ message: 'server error' });
};
