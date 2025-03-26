export class ApiError extends Error {
  constructor({ status, message, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors = {}) {
    return new ApiError({
      status: 400,
      message,
      errors,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      status: 401,
      message: 'Unauthorized user',
      errors,
    });
  }

  static notFound(errors) {
    return new ApiError({
      status: 404,
      message: 'Not Found',
      errors,
    });
  }

  static forbidden(message, errors = {}) {
    return new ApiError({
      status: 403,
      message,
      errors,
    });
  }
}
