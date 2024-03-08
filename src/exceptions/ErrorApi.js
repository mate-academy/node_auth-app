'use strict';

class ErrorApi extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static BadRequest(message, errors) {
    return new ErrorApi(400, message, errors);
  }

  static Unauthorized() {
    return new ErrorApi(401, 'User is not authorized');
  }

  static NotFound(target) {
    return new ErrorApi(404, `Not found ${target}`);
  }
}

module.exports = { ErrorApi };
