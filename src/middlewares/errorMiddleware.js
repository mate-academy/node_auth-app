'use strict';

import { ApiError } from '../exceptions/ApiError.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({
      message, errors,
    });

    return;
  }

  res.status(500).send({
    message: 'Unexpected error',
  });
};
