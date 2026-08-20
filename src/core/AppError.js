export class AppError extends Error {
  constructor(msg, statusCode = 400, error = null) {
    super(msg);

    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}
