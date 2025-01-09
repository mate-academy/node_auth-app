/* eslint-disable no-console */

import { ApiError } from '../exeptions/api.error.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  console.log(error);

  res.status(500).send({ message: 'Server error' });
}
