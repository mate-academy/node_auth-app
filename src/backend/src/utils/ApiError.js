'use strict';

class ApiError extends Error {
  constructor({ status, message, errors = {} }) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({ status: 400, message, errors });
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError({ status: 401, message });
  }

  static notFound(message = 'Not found') {
    return new ApiError({ status: 404, message });
  }
}

module.exports = { ApiError };
