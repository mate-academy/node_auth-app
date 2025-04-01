class ApiError extends Error {
  constructor({ message, status, errors = null }) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message, errors) {
    return new ApiError({
      message,
      errors,
      status: 400,
    });
  }

  static unauthorized(errors) {
    return new ApiError({
      message: 'unauthorized user',
      errors,
      status: 401,
    });
  }

  static notFound(errors) {
    return new ApiError({
      message: 'not found',
      errors,
      status: 404,
    });
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError({
      message,
      status: 500,
    });
  }
}

module.exports = {
  ApiError,
};
