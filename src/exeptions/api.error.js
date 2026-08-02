export class ApiError extends Error {
  constructor({ message, statusCode, errors = {} }) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({ message, errors, statusCode: 400 });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'unauthorized user',
      errors,
      statusCode: 401,
    });
  }

  static notFound(errors) {
    return new ApiError({ message: 'not found', errors, statusCode: 404 });
  }
}
