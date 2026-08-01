export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      status: 400,
      errors,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'Not authorized',
      status: 401,
      errors,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'not found',
      status: 404,
      errors,
    });
  }
}
