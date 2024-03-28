'use strict';

const { ErrorMessages } = require('../enums/enums.js');

class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static Unauthorized() {
    return new ApiError(401, ErrorMessages.UNAUTHORIZED);
  }

  static NotFound() {
    return new ApiError(404, ErrorMessages.NOT_FOUND);
  }

  static Forbidden() {
    return new ApiError(403, ErrorMessages.FORBIDEN);
  }
}

module.exports = {
  ApiError,
};
