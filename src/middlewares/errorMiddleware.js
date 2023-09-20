
import { ApiError } from '../exeptions/apiError.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    // eslint-disable-next-line no-console
    console.log('error');

    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.status(500).send({ message: 'Server error' });
};
