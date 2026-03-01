/* eslint-disable no-console */

import { ApiError } from '../exceptions/api.error.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    return res.status(status).json({ message, errors });
  }

  console.error('Unhandled Error:', error);

  return res.status(500).json({
    message: 'Unexpected server error',
  });
}
