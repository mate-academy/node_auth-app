'use strict';

class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);

    this.status = status;
    this.details = details;
    this.name = 'ApiError';

    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}

module.exports = {
  ApiError,
};
