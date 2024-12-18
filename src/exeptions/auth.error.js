class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    Object.assign(this, { status, errors });
  }

  static badRequest(message, errors) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(errors) {
    return new ApiError(401, 'Unauthorized', errors);
  }

  static notFound(errors) {
    return new ApiError(404, 'Not Found', errors);
  }
}

module.exports = {
  ApiError,
};
