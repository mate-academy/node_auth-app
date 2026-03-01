const DEFAULT_ERRORS = {
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Unauthorized user',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  TOO_MANY_REQUESTS: 'Too many requests. Try again later.',
};

export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = DEFAULT_ERRORS.BAD_REQUEST, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(message = DEFAULT_ERRORS.UNAUTHORIZED, errors) {
    return new ApiError({
      message,
      errors,
      status: 401,
    });
  }

  static forbidden(message = DEFAULT_ERRORS.FORBIDDEN, errors) {
    return new ApiError({
      message,
      errors,
      status: 403,
    });
  }

  static notFound(message = DEFAULT_ERRORS.NOT_FOUND, errors) {
    return new ApiError({
      message,
      errors,
      status: 404,
    });
  }

  static tooManyRequests(message = DEFAULT_ERRORS.TOO_MANY_REQUESTS) {
    return new ApiError({
      message,
      errors,
      status: 429,
    });
  }
}
