class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);

    Object.assign(this, { status, errors });
  }

  static badRequest(message, errors) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(errors) {
    return new ApiError('Unauthorized', 401, errors);
  }

  static notFound(errors) {
    return new ApiError('Not Found', 404, errors);
  }
}

module.exports = {
  ApiError,
};
