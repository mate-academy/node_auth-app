'use strict';

class ExceptionsErrors extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ExceptionsErrors(400, message, errors);
  }

  static Unauthorized() {
    return new ExceptionsErrors(401, 'User is unauthorized');
  }

  static NotFound() {
    return new ExceptionsErrors(404, 'User not found');
  }
}

module.exports = ExceptionsErrors;
