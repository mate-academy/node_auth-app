import { RequestHandler } from 'express';
import { ApiError } from '../exceptions/ApiError';

export const notFoundMiddleware: RequestHandler = () => {
  throw ApiError.notFound('Route not found');
};
