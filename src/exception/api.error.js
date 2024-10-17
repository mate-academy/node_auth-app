export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

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

  static unautorized(errors) {
    return new ApiError({
      message: 'unautirized user',
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
