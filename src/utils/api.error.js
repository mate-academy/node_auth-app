'use strict';

class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static NotFound() {
    return new ApiError(404, 'Not found');
  }

  static BadRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized(message) {
    return new ApiError(401, message || 'User is not authorized');
  }
}

exports.ApiError = ApiError;
