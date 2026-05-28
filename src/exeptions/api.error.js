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

  static unauthorized(message, errors) {
    return new ApiError({
      message: 'unaunthorized user',
      errors,
      status: 401,
    });
  }

  static notFound(message, errors) {
    return new ApiError({
      message: 'not found',
      errors,
      status: 404,
    });
  }

  static forbidden(message, errors) {
    return new ApiError({
      message: 'Forbidden',
      errors,
      status: 403,
    });
  }
}
