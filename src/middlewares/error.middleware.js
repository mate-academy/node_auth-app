import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    return res.status(status).send({ message, errors });
  }

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(error.message || ReasonPhrases.INTERNAL_SERVER_ERROR);
};
