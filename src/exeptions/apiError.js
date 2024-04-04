class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized() {
    return new ApiError(401, 'User is not authorized');
  }

  static notFound() {
    return new ApiError(404, 'Not found');
  }
}

module.exports = {
  ApiError,
};
