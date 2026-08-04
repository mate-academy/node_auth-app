export class ApiError extends Error {
  constructor({ message, statusCode, errors = {} }) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      statusCode: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized user',
      errors,
      statusCode: 401,
    });
  }

  static forbidden(message = 'Access forbidden', errors) {
    return new ApiError({
      message,
      errors,
      statusCode: 403,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'Not found',
      errors,
      statusCode: 404,
    });
  }
}
