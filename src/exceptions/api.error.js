'use strict';

class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(message, 400, errors);
  }

  static notFound(errors) {
    return new ApiError('not found', 404, errors);
  }

  static unAuthorized(message) {
    return new ApiError(message || 'User is unauthorized', 401);
  }
}

module.exports = { ApiError };
