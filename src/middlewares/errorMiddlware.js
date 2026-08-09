import { ApiError } from '../exeptions/ApiError.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, meassage, errors } = error;

    res.status(status).send(meassage, errors);

    return;
  }

  res.status(500).send({
    message: 'Unexpected error',
  });
}
