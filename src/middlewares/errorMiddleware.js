import { ApiError } from '../exeptions/api.error.js';
import { ConsoleLogger } from '../untils/consoleLogger.js';

export const errorMiddleware = (error, req, res, next) => {
  ConsoleLogger.error('Error: ', error);

  if (error instanceof ApiError) {
    return res.status(error.status).send({
      message: error.message,
      errors: error.errors,
    });
  }

  res.statusCode = 500;

  return res.send({
    message: 'Server error :(',
  });
};
