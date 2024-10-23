import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  // eslint-disable-next-line no-console
  console.error(error);

  if (error) {
    res.statusCode = 500;

    res.send({
      message: 'Server error',
    });
  }

  next();
};
