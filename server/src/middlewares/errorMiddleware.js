/* eslint-disable no-useless-return */
import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  if (error) {
    res.statusCode = 500;

    res.send({
      message: error,
    });

    return;
  }

  next();
};
