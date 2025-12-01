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
      message: 'Unauthorize user',
      status: 401,
      errors,
    });
  }

  static notFound(errors, message = 'Resource not Found') {
    return new ApiError({
      message,
      status: 404,
      errors,
    });
  }
}
