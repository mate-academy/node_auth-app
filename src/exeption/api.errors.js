export class ApiError extends Error {
  constructor({ message, status, errors }) {
    super(message);

    this.errors = errors;
    this.status = status;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized user',
      errors,
      status: 401,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'not found',
      errors,
      status: 404,
    });
  }
}
