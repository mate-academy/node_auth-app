import { ErrorRequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, errors: err.errors });

    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
};
