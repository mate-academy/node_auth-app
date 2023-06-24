'use strict';

class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors = {}) {
    return new ApiError(message, 400, errors);
  }

  static Unauthorized() {
    return new ApiError('User is not authorized', 401);
  }

  static NotFound() {
    return new ApiError('Not found', 404);
  }
}

module.exports = { ApiError };
