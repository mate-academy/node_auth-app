import { ApiError } from '../exeptions/api.error.js';

export const notFoundMiddleware = () => {
  throw ApiError.notFound('API does not exist');
};
