export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(errors = []) {
    return new ApiError('Unauthorized user', 401, errors);
  }

  static notFound(errors = []) {
    return new ApiError('Not found', 404, errors);
  }
}
