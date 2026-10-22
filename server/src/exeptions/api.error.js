class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super();
    this.status = status;
    this.message = message;
    this.errors = errors;
  }

  static BadRequest(message, errors = {}) {
    return new ApiError(400, message, errors);
  }

  static UnauthorizedError(errors = {}) {
    return new ApiError(401, 'User is not authorized', errors);
  }

  static Conflict(message, errors = {}) {
    return new ApiError(409, message, errors);
  }

  static NotFound(errors = {}) {
    return new ApiError(404, 'Not found', errors);
  }
}

module.exports = { ApiError };
