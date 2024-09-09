import { ApiError } from '../exeptions/api-error.js';

export const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const { status, message, errors } = err;

    res.status(status).send({ message, errors });

    return;
  }
  res.status(500).send({
    message: 'Something went wrong',
  });
};
