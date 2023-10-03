
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
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
      message: 'not found',
      errors,
    });
  }
}
