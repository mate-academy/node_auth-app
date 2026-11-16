import { ApiError } from '../exceptions/api.error.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    // eslint-disable-next-line no-useless-return
    return;
  }

  // eslint-disable-next-line no-console
  console.error(error);
  res.status(500).send({ message: 'Server error' });
}
