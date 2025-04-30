import { ApiError } from '../exceptions/api.error.js';
import { NextFunction, Request, Response } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  _next(err);
  // res.status(500).json({ message: 'Internal Server Error' });
}
