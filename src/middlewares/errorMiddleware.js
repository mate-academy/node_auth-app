
import { ApiError } from '../exeptions/apiError.js';

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;
    // eslint-disable-next-line no-console

    // res.status(error.status).send({
      //   message: error.message,
      //   errors: error.errors,
      // });
      res.status(status).send({ message, errors });
      return;
    }
    
    console.log('error');

  res.status(500).send({ message: 'Server error' });
};
