import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    res.status(status).send({ message, errors });
    return;
  }

  console.log(error);

  res.status(500).send({
    message: 'Unexpected error',
  });
};

export const notFoundMiddleware = (req, res, next) => {
  res.status(404).send({ message: 'Page not found' });
};
