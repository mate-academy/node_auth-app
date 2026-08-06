export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = 'Bad request', errors = {}) {
    return new ApiError(message, 400, errors);
  }

  static unauth(message = 'Unauthorized', errors = {}) {
    return new ApiError(message, 401, errors);
  }

  static forbidden(message = 'Forbidden', errors = {}) {
    return new ApiError(message, 403, errors);
  }

  static notFound(message = 'Not found', errors = {}) {
    return new ApiError(message, 404, errors);
  }

  static conflict(message = 'Conflict', errors = {}) {
    return new ApiError(message, 409, errors);
  }

  static internal(message = 'Internal server error', errors = {}) {
    return new ApiError(message, 500, errors);
  }
}
