/* eslint-disable no-console */
import { ApiError } from '../exeptions/api.error.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  console.error(error);

  return res.status(500).send({ message: 'Server error' });
}
