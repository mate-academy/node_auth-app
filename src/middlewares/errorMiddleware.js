import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.status).send({
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  res.statusCode = 500;

  res.send({
    message: 'Server error',
  });
};
