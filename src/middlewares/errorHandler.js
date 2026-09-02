import { ApiError } from '../utils/ApiError.js';

export function errorHandler(error, req, res, next) {
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
    });
  }

  console.error(error);

  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
  });
}
