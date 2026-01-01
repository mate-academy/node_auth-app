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

  static unauthorized(errors) {
    return new ApiError({
      message: 'unauthorized user',
      errors,
      status: 401,
    });
  }

  static notActivated(errors) {
    return new ApiError({
      message: 'Account is not activated',
      errors,
      status: 403,
    });
  }
}
