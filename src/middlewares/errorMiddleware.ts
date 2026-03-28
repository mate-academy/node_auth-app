import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from 'express';
import { ApiError } from '../exceptions/ApiError.js';

export function errorMiddleware(
  error: Error,
  request: ExpressRequest,
  response: ExpressResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return response.redirect('/auth/login');
    }

    if (error.status === 404) {
      return response.status(404).render('404');
    }

    return response
      .status(error.status)
      .send({ message: error.message, errors: error.errors });
  }

  response.status(500).send({ message: 'Unexpected error' });
}
