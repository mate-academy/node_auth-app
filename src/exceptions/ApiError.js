'use strict';

class ApiError extends Error {
  constructor(status, message, error = {}) {
    super(message);
    this.status = status;
    this.error = error;
  }

  static BadRequest(message) {
    return new ApiError(400, message);
  }

  static Unauthorized() {
    return new ApiError(401, 'User is not authorized');
  }

  static NotFound() {
    return new ApiError(404, 'Not found');
  }
}

module.exports = { ApiError };
