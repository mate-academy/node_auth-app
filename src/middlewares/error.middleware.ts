import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
      },
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
    },
  });
};
