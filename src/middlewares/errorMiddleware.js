/* eslint-disable no-console */
import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    console.error('Headers already sent:', error);

    return;
  }

  if (error instanceof ApiError) {
    return res
      .status(error.status)
      .send({ message: error.message, errors: error.errors });
  }

  console.error('Unexpected error:', error);

  return res.status(500).send({ message: 'Server error' });
};
