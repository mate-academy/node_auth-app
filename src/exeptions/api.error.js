'use strict';

class ApiError extends Error {
  constructor({ message, status, error = {} }) {
    super(message);

    this.status = status;
    this.error = error;
  }

  static badRequest({ message }) {
    return new ApiError({ message, status: 400 });
  }

  static unauthorized({ message }) {
    return new ApiError({ message, status: 404 });
  }
}

module.exports = {
  ApiError,
};
