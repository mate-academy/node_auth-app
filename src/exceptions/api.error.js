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

  static notFound(errors) {
    return new ApiError({
      message: 'Not found',
      errors,
      code: 404,
    });
  }

  static unAuthorized(errors) {
    return new ApiError({
      message: 'Unauthorized request',
      errors,
      status: 401,
    });
  }
}
