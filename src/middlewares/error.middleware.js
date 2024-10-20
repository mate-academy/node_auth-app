/* eslint-disable no-console */
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    const { status, message, errors } = error;

    console.error('Handled API error:', error.message, error.errors);

    return res.status(status).send({ message, errors });
  }

  console.error('Unhandled error:', error);

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(error.message || ReasonPhrases.INTERNAL_SERVER_ERROR);
};
