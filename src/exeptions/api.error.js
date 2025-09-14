export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(message = 'Unauthorized user', errors = {}) {
    return new ApiError({
      message,
      errors,
      status: 401,
    });
  }

  static notFound(message = 'Not found', errors = {}) {
    return new ApiError({
      message,
      errors,
      status: 404,
    });
  }
}
