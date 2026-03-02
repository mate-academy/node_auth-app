import { ApiError } from '../exeptions/api.error.js';

export const errorMiddleware = (error, req, res) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  } else {
    res.status(500).send({ message: 'Server error' });
  }
};
