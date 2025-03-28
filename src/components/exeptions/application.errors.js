'use strict';

class ApplicationErrors extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ApplicationErrors(400, message, errors);
  }

  static Unauthorized(message = 'User is unauthorized') {
    return new ApplicationErrors(401, message);
  }

  static NotFound(message = 'User not found') {
    return new ApplicationErrors(404, message);
  }
}

module.exports = ApplicationErrors;
