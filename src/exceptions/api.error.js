'use strict';

class ApiError extends Error {
  constructor({ message, status, errors = {} }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static Unauthorized(errors) {
    return new ApiError({
      message: 'Unauthorized user',
      errors,
      status: 401,
    });
  }

  static NotFound(errors) {
    return new ApiError({
      message: 'Not found',
      errors,
      status: 404,
    });
  }

  static Conflict(errors) {
    return new ApiError({
      message: 'Conflict',
      errors,
      status: 409,
    });
  }
};

module.exports = {
  ApiError,
};
