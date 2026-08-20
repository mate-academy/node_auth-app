import { AppError } from '../core/AppError.js';
import 'dotenv/config';

function toErrorLike(err) {
  if (err instanceof AppError) {
    return {
      message: err.message,
      statusCode: err.statusCode,
      status: err.status,
      isOperational: true,
      stack: err.stack,
    };
  } else if (err instanceof Error) {
    const statusCode = err.statusCode ? err.statusCode : 500;
    const status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    return {
      message: err.message,
      statusCode: statusCode,
      status: status,
      isOperational: false,
      stack: err.stack,
    };
  } else {
    return {
      message: typeof err === 'string' ? err : 'Unknown error',
      statusCode: 500,
      status: 'error',
      isOperational: false,
    };
  }
}

export const errorHandler = (err, req, res, next) => {
  const normalized = toErrorLike(err);

  if (process.env.NODE_ENV === 'development') {
    res.status(normalized.statusCode).json({
      status: normalized.status,
      message: normalized.message,
      stack: normalized.stack,
    });
  } else {
    res.status(normalized.statusCode).json({
      status: normalized.status,
      message: normalized.isOperational
        ? normalized.message
        : 'Something went wrong on the server',
    });
  }
};
