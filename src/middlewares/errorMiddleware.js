import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.status).send({
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  res.status(500).send({
    message: 'Server error',
  });
  next();
};
