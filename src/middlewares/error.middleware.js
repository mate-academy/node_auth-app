import { ApiError } from '../exceptions/Api.error.js';

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .send({ message: err.message, errors: err.errors });
  }

  res.status(500).send({ message: 'Internal Server Error' });
};

export default errorMiddleware;
