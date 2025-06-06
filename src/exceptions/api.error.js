export class APIError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new APIError({
      message,
      errors,
      status: 400,
    });
  }
  static unauthorized(errors) {
    return new APIError({
      message: 'Unauthorized',
      errors,
      status: 401,
    });
  }
  static notFound(errors) {
    return new APIError({ message: 'Not found', errors, status: 404 });
  }
}
