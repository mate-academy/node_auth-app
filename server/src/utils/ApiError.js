'use strict';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }
}

module.exports = { ApiError };
