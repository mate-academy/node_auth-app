import { ApiError } from '../exeptions/apiError.js';

export const errorMiddleWare = (error, req, res, next) => {
  // console.error(err.stack);

  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  if (error) {
    res.statusCode = 500;

    res.send({
      message: 'Server Error',
    });
  }

  next();
};
