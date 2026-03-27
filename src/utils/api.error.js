export class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = 'Bad Request', errors = {}) {
    return new ApiError({ message, status: 400, errors });
  }

  static unauthorized(message = 'Unauthorized', errors = {}) {
    return new ApiError({ message, status: 401, errors });
  }

  static forbidden(message = 'Forbidden', errors = {}) {
    return new ApiError({ message, status: 403, errors });
  }

  static notFound(message = 'Not Found', errors = {}) {
    return new ApiError({ message, status: 404, errors });
  }

  static internal(message = 'Internal Server Error', errors = {}) {
    return new ApiError({ message, status: 500, errors });
  }
}
