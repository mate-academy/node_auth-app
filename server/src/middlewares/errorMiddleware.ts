import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../exceptions/api.error.js';

export const errorMidleware: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
};
