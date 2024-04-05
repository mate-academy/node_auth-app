import { ApiError } from '../exeptions/ApiError.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });
    return;
  }

  res.status(500).send({
    message: 'Server error',
  });
}
  